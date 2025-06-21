import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { readdirSync } from "fs";
import path from "path";

import type {
  inducks_entry,
  inducks_entryurl,
} from "~prisma-schemas/client_coa/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { getImageVector, loadModel } from "../services/story-search";

declare global {
  interface ImportMeta {
    dir: string;
  }
}
await loadModel();

const root =
  process.env.ENTRYURLS_DIR ||
  path.resolve(`${import.meta.dir}/../services/story-search/covers`);

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

const existingVectors = (
  await prismaCoa.inducks_entryurl_vector.findMany({
    select: {
      entrycode: true,
    },
  })
).map((v) => v.entrycode);

for (const file of files) {
  if (file.isDirectory() || !file.parentPath.includes("webusers")) {
    continue;
  }

  const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;

  const entry = (
    await prismaCoa.$queryRaw<
      {
        entrycode: Exclude<inducks_entryurl["entrycode"], null>;
        isCover: inducks_entry["isCover"];
      }[]
    >`
        SELECT entrycode, is_cover as isCover
        FROM inducks_entryurl eu
        INNER JOIN inducks_entry e USING (entrycode)
        WHERE sitecode='webusers' AND url = ${relativePath.replace("webusers/webusers/", "")}
    `
  )[0];

  if (!entry) {
    console.log(`Entry not found for ${relativePath}`);
    continue;
  }

  if (existingVectors.includes(entry.entrycode)) {
    console.log(`Vector already exists for ${relativePath}`);
    continue;
  }

  try {
    const vector = await getImageVector(`${file.parentPath}/${file.name}`);

    // Convert the vector to a string representation that MariaDB can understand
    // Format: [x1,x2,x3,...] where xi are floating point numbers
    const vectorString = `[${vector.vector.join(",")}]`;

    prismaCoa.$executeRaw`
  INSERT INTO inducks_entryurl_vector (entrycode, v, is_cover)
  VALUES (${entry.entrycode}, VEC_FromText(${vectorString}), ${entry.isCover})
`
      .then(() => {
        console.log(
          `Added image vector ${entry.entrycode} for ${relativePath}`,
        );
      })
      .catch((error) => {
        console.error(`Error adding image vector for ${relativePath}`, error);
      });
  } catch (error) {
    console.error(`Error creating image vector for ${relativePath}`, error);
  }
}
