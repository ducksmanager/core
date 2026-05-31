import { expect, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import { config } from "dotenv";
import type { getCsvMetadata } from "../src/composables/useCsvExport";

export const cwd = existsSync("apps") ? "apps/dumili" : ".";

config({ path: `${cwd}/tests/.env.inducks` });

const goto = (page: Page, url: string) =>
  page.goto(url, { waitUntil: "domcontentloaded" });

export default async (
  page: Page,
  metadata: ReturnType<typeof getCsvMetadata>,
  csvFixtureFile: string,
  dbiFixtureFile: string,
) =>
  new Promise(async (resolve) => {
    await goto(page, "https://inducks.org/maccount.php");
    await page
      .getByRole("textbox", { name: "Login Login" })
      .fill(process.env.INDUCKS_USERNAME!);
    await page
      .getByRole("textbox", { name: "Password Password" })
      .fill(process.env.INDUCKS_PASSWORD!);
    await page.getByRole("button", { name: "Log in" }).click();
    await goto(page, "https://inducks.org/csvinx.php");
    await page
      .getByRole("textbox", { name: "Issue code" })
      .fill(metadata.issuecode);
    await page
      .getByRole("textbox", { name: "Issue date" })
      .fill(metadata.issdate);
    if (metadata.price) {
      await page.getByRole("textbox", { name: "Price" }).fill(metadata.price);
    }
    if (metadata.issue_comment) {
      await page
        .getByRole("textbox", { name: "Notes about the issue" })
        .fill(metadata.issue_comment);
    }
    await page.getByRole("button", { name: "Upload CSV file" }).click();
    await page
      .getByRole("button", { name: "Upload CSV file" })
      .setInputFiles(`${cwd}/tests/fixtures/${csvFixtureFile}`);
    await page.getByRole("button", { name: "Check generated index" }).click();
    expect(await page.locator("textarea[name='newtext']").textContent()).toBe(
      readFileSync(`${cwd}/tests/fixtures/${dbiFixtureFile}`, "utf8"),
    );
    resolve(true);
  });
