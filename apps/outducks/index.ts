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

const root =
  process.env.ENTRYURLS_DIR ||
  resolve(`${import.meta.dir}/../../packages/api/services/story-search/covers`);

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

const existingEntryUrls = (
  await prismaCoa.inducks_entryurl.findMany({
    select: {
      sitecode: true,
      url: true,
    },
    where: {
      sitecode: {
        notIn: ["thumbnails", "thumbnails2", "thumbnails3", "renamed"],
      },
    },
  })
).map((v) => `${v.sitecode}/${v.url}`);

const BATCH_SIZE = 50;

const filesToProcess: {
  filePath: string;
  relativePath: string;
  file: { isDirectory: () => boolean; parentPath: string; name: string };
}[] = [];

for (const file of files) {
  if (file.isDirectory()) {
    continue;
  }

  const relativePath = `${file.parentPath.replace(root + "/", "")}/${
    file.name
  }`;
  filesToProcess.push({
    filePath: `${file.parentPath}/${file.name}`,
    relativePath,
    file,
  });
}

console.log(`Found ${filesToProcess.length} files to process`);

// const browser = await firefox.launch();
// const page = await browser.newPage();
// await page.goto("https://inducks.org/maccount.php");

// await page.getByRole("textbox", { name: "Login Login" }).fill("Bruno Pérel");
// await page.getByRole("textbox", { name: "Password Password" }).fill("delph8");
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
