import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { existsSync, linkSync, mkdirSync, readdirSync } from "fs";
import type {
  inducks_storyversion,
} from "~prisma-schemas/client_coa/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";


declare global {
  interface ImportMeta {
    dir: string;
  }
}
const root =
  process.env.ENTRYURLS_DIR ||
  path.resolve(`${import.meta.dir}/../services/story-search/covers`);

const rootGrouped = `${root}-by-storycode`;
mkdirSync(rootGrouped, { recursive: true });

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

for (const file of files) {
  if (file.isDirectory() || !file.parentPath.includes("webusers")) {
    continue;
  }

  const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;

  const storycode = (
    await prismaCoa.$queryRaw<
      {
        storycode: inducks_storyversion['storycode'];
      }[]
    >`
        SELECT sv.storycode
FROM inducks_entryurl eu
         INNER JOIN inducks_entry e USING (entrycode)
         INNER JOIN inducks_storyversion sv on e.storyversioncode = sv.storyversioncode
WHERE sitecode = 'webusers'
  AND url = ${relativePath.replace("webusers/webusers/", "")}
    `
  )[0]?.storycode;

  if (storycode) {
    const storycodeDir = path.join(rootGrouped, storycode);
    if (!existsSync(storycodeDir)) {
      mkdirSync(storycodeDir, { recursive: true });
    }
    if (existsSync(path.join(storycodeDir, file.name))) {
      console.debug(`File already exists for ${relativePath}`);
    }
    else {
      linkSync(path.join(root, relativePath), path.join(storycodeDir, file.name));
    }
    console.log(`Linked ${relativePath} to ${storycodeDir}`);
  }
  else {
    console.debug(`Storycode not found for ${relativePath}`);
  }
}