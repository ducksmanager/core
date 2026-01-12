import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
import { readdirSync } from "fs";
import * as fs from "fs/promises";
import path from "path";

import {
  type inducks_entry,
  type inducks_entryurl,
} from "~prisma-schemas/client_coa/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa";

import {
  formatVectorForDB,
  getImageVector,
  getSession,
} from "../services/story-search";

declare global {
  interface ImportMeta {
    dir: string;
  }
}

await getSession();

const root =
  process.env.ENTRYURLS_DIR ||
  path.resolve(`${import.meta.dir}/../services/story-search/covers`);

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

// Set RECALCULATE_ALL=true to force recalculation of all vectors (useful after model retraining)
const RECALCULATE_ALL = process.env.RECALCULATE_ALL === "true";

if (RECALCULATE_ALL) {
  console.log("⚠️ RECALCULATE_ALL=true: Will recalculate all vectors (existing vectors will be replaced)");
} else {
  const existingVectorCount = await prismaCoa.inducks_entryurl_vector.count();
  console.log(`Found ${existingVectorCount} existing vectors (will skip these)`);
}

const filesToProcess: {
  filePath: string;
  relativePath: string;
  file: { isDirectory: () => boolean; parentPath: string; name: string };
}[] = [];

for (const file of files) {
  if (file.isDirectory() || !file.parentPath.includes("webusers")) {
    continue;
  }

  const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;
  filesToProcess.push({
    filePath: `${file.parentPath}/${file.name}`,
    relativePath,
    file,
  });
}

console.log(`Found ${filesToProcess.length} files to process`);

const tableName = `temp_files_to_process_${Date.now()}`;
const PROCESS_BATCH_SIZE = 50;
const INSERT_BATCH_SIZE = 1000;
const VECTOR_INSERT_BATCH_SIZE = 100;

const processFiles = async (tableName: string) => {
  const filesWithEntries = RECALCULATE_ALL
    ? await prismaCoa.$queryRawUnsafe<
        {
          filePath: string;
          relativePath: string;
          entrycode: Exclude<inducks_entryurl["entrycode"], null>;
          isCover: inducks_entry["isCover"];
          url: string;
        }[]
      >(`
        SELECT 
          tf.file_path AS filePath,
          tf.relative_path AS relativePath,
          eu.entrycode,
          e.is_cover as isCover,
          tf.url
        FROM ${tableName} tf
        INNER JOIN inducks_entryurl eu ON eu.sitecode = 'webusers' AND eu.url = tf.url
        INNER JOIN inducks_entry e USING (entrycode)
      `)
    : await prismaCoa.$queryRawUnsafe<
        {
          filePath: string;
          relativePath: string;
          entrycode: Exclude<inducks_entryurl["entrycode"], null>;
          isCover: inducks_entry["isCover"];
          url: string;
        }[]
      >(`
        SELECT 
          tf.file_path AS filePath,
          tf.relative_path AS relativePath,
          eu.entrycode,
          e.is_cover as isCover,
          tf.url
        FROM ${tableName} tf
        INNER JOIN inducks_entryurl eu ON eu.sitecode = 'webusers' AND eu.url = tf.url
        INNER JOIN inducks_entry e USING (entrycode)
        LEFT JOIN inducks_entryurl_vector ev ON ev.entrycode = eu.entrycode
        WHERE ev.entrycode IS NULL
      `);

  if (filesWithEntries.length === 0) {
    console.log("No valid files to process");
    return;
  }

  const filesWithEntriesUrls = new Set(filesWithEntries.map(f => f.url));
  const allFiles = await prismaCoa.$queryRawUnsafe<{ url: string; relativePath: string }[]>(`
    SELECT url, relative_path AS relativePath
    FROM ${tableName}
  `);
  
  for (const file of allFiles) {
    if (!filesWithEntriesUrls.has(file.url)) {
      console.log(`Entry not found for ${file.relativePath}`);
    }
  }

  let totalProcessed = 0;

  for (let i = 0; i < filesWithEntries.length; i += PROCESS_BATCH_SIZE) {
    const batch = filesWithEntries.slice(i, i + PROCESS_BATCH_SIZE);
    const batchNumber = Math.floor(i / PROCESS_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(filesWithEntries.length / PROCESS_BATCH_SIZE);
    
    console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

    const vectorPromises = batch.map(async (item) => {
      try {
        try {
          await fs.access(item.filePath);
        } catch (accessError) {
          console.error(
            `File not accessible: ${item.relativePath}`,
            accessError,
          );
          return null;
        }

        const vector = await getImageVector(item.filePath);
        const vectorString = formatVectorForDB(vector.vector);

        if (!vector.vector || vector.vector.length === 0) {
          console.error(
            `Empty vector generated for ${item.relativePath}`,
          );
          return null;
        }

        return {
          entrycode: item.entrycode,
          vectorString,
          isCover: item.isCover,
          relativePath: item.relativePath,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
          `Error creating image vector for ${item.relativePath}: ${errorMessage}`,
        );
        if (error instanceof Error && error.stack) {
          console.error(`Stack trace: ${error.stack}`);
        }
        return null;
      }
    });

    const vectorResults = await Promise.all(vectorPromises);
    const validVectors = vectorResults.filter(
      (result): result is NonNullable<typeof result> => result !== null,
    );

    if (validVectors.length === 0) {
      console.log(`No valid vectors generated in batch ${batchNumber}`);
      continue;
    }

    await prismaCoa.$transaction(async (tx) => {
      const escapeSqlString = (str: string) => str.replace(/\\/g, "\\\\").replace(/'/g, "''");

      if (RECALCULATE_ALL) {
        for (const vector of validVectors) {
          const entrycodeEscaped = escapeSqlString(vector.entrycode);
          const vectorStringEscaped = escapeSqlString(vector.vectorString);
          
          await tx.$executeRawUnsafe(`
            INSERT INTO inducks_entryurl_vector (entrycode, v, is_cover)
            VALUES ('${entrycodeEscaped}', VEC_FromText('${vectorStringEscaped}'), ${vector.isCover})
            ON DUPLICATE KEY UPDATE v = VALUES(v), is_cover = VALUES(is_cover)
          `);
        }
      } else {
        for (let j = 0; j < validVectors.length; j += VECTOR_INSERT_BATCH_SIZE) {
          const vectorBatch = validVectors.slice(j, j + VECTOR_INSERT_BATCH_SIZE);
          const values = vectorBatch
            .map(
              (v) => {
                const entrycodeEscaped = escapeSqlString(v.entrycode);
                const vectorStringEscaped = escapeSqlString(v.vectorString);
                return `('${entrycodeEscaped}', VEC_FromText('${vectorStringEscaped}'), ${v.isCover})`;
              }
            )
            .join(", ");

          await tx.$executeRawUnsafe(`
            INSERT INTO inducks_entryurl_vector (entrycode, v, is_cover)
            VALUES ${values}
          `);
        }
      }

      totalProcessed += validVectors.length;
      console.log(
        `Successfully inserted ${validVectors.length} vectors (total: ${totalProcessed})`,
      );
    }).catch((error) => {
      console.error(`Error inserting vectors from batch ${batchNumber}:`, error);
    });
  }
};

await prismaCoa.$transaction(
  async (tx) => {
    await tx.$executeRawUnsafe(`
      CREATE TABLE ${tableName} (
        file_path VARCHAR(500) NOT NULL,
        relative_path VARCHAR(500) NOT NULL,
        url VARCHAR(500) NOT NULL,
        INDEX idx_url (url)
      )
    `);

    const escapeSqlString = (str: string) => str.replace(/\\/g, "\\\\").replace(/'/g, "''");

    let insertedCount = 0;

    for (let i = 0; i < filesToProcess.length; i += INSERT_BATCH_SIZE) {
      const batch = filesToProcess.slice(i, i + INSERT_BATCH_SIZE);
      const values = batch
        .map((item) => {
          const url = item.relativePath.replace("webusers/webusers/", "");
          const filePathEscaped = escapeSqlString(item.filePath);
          const relativePathEscaped = escapeSqlString(item.relativePath);
          const urlEscaped = escapeSqlString(url);
          return `('${filePathEscaped}', '${relativePathEscaped}', '${urlEscaped}')`;
        })
        .join(", ");

      await tx.$executeRawUnsafe(`
        INSERT INTO ${tableName} (file_path, relative_path, url)
        VALUES ${values}
      `);
      insertedCount += batch.length;
    }

    console.log(`Inserted ${insertedCount} files into table ${tableName}`);
  },
  {
    timeout: 30000
  }
);

try {
  await processFiles(tableName);
} finally {
  console.log(`Dropping table ${tableName}...`);
  await prismaCoa.$executeRawUnsafe(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Table ${tableName} dropped`);
  process.exit(0);
}
