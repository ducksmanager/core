import { test, expect, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import { config } from "dotenv";

const cwd = existsSync("apps") ? "apps/dumili" : ".";

config({ path: `${cwd}/tests/.env.inducks` });

const goto = (page: Page, url: string) =>
  page.goto(url, { waitUntil: "domcontentloaded" });

test("test", async ({ page }) => {
  await goto(page, "https://inducks.org/maccount.php");
  await page
    .getByRole("textbox", { name: "Login Login" })
    .fill(process.env.INDUCKS_USERNAME!);
  await page
    .getByRole("textbox", { name: "Password Password" })
    .fill(process.env.INDUCKS_PASSWORD!);
  await page.getByRole("button", { name: "Log in" }).click();
  await goto(page, "https://inducks.org/csvinx.php");
  await page.getByRole("textbox", { name: "Issue code" }).fill("si/MS 2003-12");
  await page.getByRole("textbox", { name: "Issue date" }).fill("2026");
  await page.getByRole("button", { name: "Upload CSV file" }).click();
  await page
    .getByRole("button", { name: "Upload CSV file" })
    .setInputFiles(`${cwd}/tests/fixtures/csv_import_example.csv`);
  await page.getByRole("button", { name: "Check generated index" }).click();
  expect(await page.locator("textarea[name='newtext']").textContent()).toBe(
    readFileSync(`${cwd}/tests/fixtures/csv_import_example.dbi.txt`, "utf8"),
  );
});
