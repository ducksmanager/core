import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { mkdirSync, readdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { firefox } from "playwright-firefox";

const excludedSitecodes = [
  "thumbnails",
  "thumbnails2",
  "thumbnails3",
  "renamed",
];

const __dirname = dirname(fileURLToPath(import.meta.url));

const root =
  process.env.ENTRYURLS_DIR ||
  resolve(`${__dirname}/../../packages/api/services/story-search/covers`);

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

const existingEntryUrls = new Set<string>(
  (
    await prismaCoa.inducks_entryurl.findMany({
      select: {
        sitecode: true,
        url: true,
      },
      where: {
        sitecode: {
          notIn: excludedSitecodes,
        },
      },
    })
  ).map(
    (v) =>
      `${v.sitecode === "webusers" ? "webusers/" : ""}${v.sitecode}/${v.url}`
  )
);
console.log(`Found ${existingEntryUrls.size} existing entry URLs`);

const existingFiles = new Set<string>(
  files
    .filter(
      (file) =>
        !file.isDirectory() &&
        !excludedSitecodes.includes(file.parentPath.split("/").pop()!)
    )
    .map((file) => `${file.parentPath.replace(root + "/", "")}/${file.name}`)
);
console.log(`Found ${existingFiles.size} existing files`);

const filesToCreate = new Set<string>(
  Array.from(existingEntryUrls).filter((_, idx) => idx < 200)
);

console.log(`Found ${filesToCreate.size} files to create`);

const filesToActuallyCreate = new Set<string>(
  Array.from(existingEntryUrls).filter((_, idx) => idx < 200)
);

console.log(`Will create ${filesToActuallyCreate.size} files`);

const browser = await firefox.launch();
const page = await browser.newPage();
await page.goto("https://inducks.org/maccount.php");

await page
  .getByRole("textbox", { name: "Login Login" })
  .fill(process.env.INDUCKS_USERNAME!);
await page
  .getByRole("textbox", { name: "Password Password" })
  .fill(process.env.INDUCKS_PASSWORD!);
await page.getByRole("button", { name: "Log in" }).click();
await page.getByRole("link", { name: "Home page" }).first().click();

for (const file of filesToActuallyCreate) {
  const imageUrl = `https://inducks.org/hr.php?normalsize=1&image=https://outducks.org/${file}`;
  const response = await page.request.get(imageUrl);

  mkdirSync(resolve(root, file.split("/").slice(0, -1).join("/")), {
    recursive: true,
  });

  const filename = resolve(root, file);
  writeFileSync(filename, Buffer.from(await response.body()));
  console.log(`Image saved to ${filename}`);
}

await browser.close();

process.exit(0);
