import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  type inducks_entry,
  type inducks_entryurl,
  Prisma,
} from "~prisma-schemas/client_coa/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { firefox } from "playwright-firefox";

declare global {
  interface ImportMeta {
    dir: string;
  }
}

const excludedSitecodes = [
  "thumbnails",
  "thumbnails2",
  "thumbnails3",
  "renamed",
];

const root =
  process.env.ENTRYURLS_DIR ||
  resolve(`${import.meta.dir}/../../packages/api/services/story-search/covers`);

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
  ).map((v) => `${v.sitecode}/${v.url}`)
);
console.log(`Found ${existingEntryUrls.size} existing entry URLs`);

const existingFiles = new Set<string>(
  files
    .filter(
      (file) =>
        !file.isDirectory() ||
        excludedSitecodes.includes(file.parentPath.split("/").pop()!)
    )
    .map((file) => `${file.parentPath.replace(root + "/", "")}/${file.name}`)
);
console.log(`Found ${existingFiles.size} existing files`);

const filesToCreate = existingEntryUrls.difference(existingFiles);

console.log(`Found ${filesToCreate.size} files to create`);

// const browser = await firefox.launch();
// const page = await browser.newPage();
// await page.goto("https://inducks.org/maccount.php");

// await page.getByRole("textbox", { name: "Login Login" }).fill("Bruno Pérel");
// await page.getByRole("textbox", { name: "Password Password" }).fill("test");
// await page.getByRole("button", { name: "Log in" }).click();
// await page.getByRole("link", { name: "Home page" }).first().click();

// const subdir = "webusers/webusers/2006/03";

// for (const file of readdirSync(root, {
//   recursive: true,
//   withFileTypes: true,
// })) {
//   if (file.isDirectory()) {
//     continue;
//   }

//   const imageUrl = `https://inducks.org/hr.php?normalsize=1&image=https://outducks.org/${subdir}/${file.name}`;

//   const response = await page.request.get(imageUrl);
//   const filename = resolve(root, file.name);
//   writeFileSync(filename, Buffer.from(await response.body()));
//   console.log(`Image saved to ${filename}`);
// }

// await browser.close();

process.exit(0);
