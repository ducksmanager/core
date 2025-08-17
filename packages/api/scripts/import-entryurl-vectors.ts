import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { readdirSync } from "fs";
import path from "path";

import {
  Prisma,
  type inducks_entry,
  type inducks_entryurl,
} from "~prisma-schemas/client_coa/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { formatVectorForDB, getImageVector, getSession } from "../services/story-search";

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

const existingVectors = (
  await prismaCoa.inducks_entryurl_vector.findMany({
    select: {
      entrycode: true,
    },
  })
).map((v) => v.entrycode);

const BATCH_SIZE = 50;

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

const processBatch = async (
  batch: { 
    filePath: string; 
    relativePath: string; 
    file: { isDirectory: () => boolean; parentPath: string; name: string } 
  }[],
  existingVectors: string[]
) => {
  const relativePaths = batch.map(item => 
    item.relativePath.replace("webusers/webusers/", "")
  );
  
  const entries = await prismaCoa.$queryRaw<
    {
      entrycode: Exclude<inducks_entryurl["entrycode"], null>;
      isCover: inducks_entry["isCover"];
      url: string;
    }[]
  >`
    SELECT entrycode, is_cover as isCover, url
    FROM inducks_entryurl eu
    INNER JOIN inducks_entry e USING (entrycode)
    WHERE sitecode='webusers' AND url IN (${Prisma.join(relativePaths)})
  `;

  // Create a map for quick lookup
  const entryMap = new Map(entries.map(entry => [entry.url, entry]));

  // Filter out files that don't have entries or already have vectors
  const validFiles = batch.filter(item => {
    const url = item.relativePath.replace("webusers/webusers/", "");
    const entry = entryMap.get(url);
    
    if (!entry) {
      console.log(`Entry not found for ${item.relativePath}`);
      return false;
    }
    
    if (existingVectors.includes(entry.entrycode)) {
      console.log(`Vector already exists for ${item.relativePath}`);
      return false;
    }
    
    return true;
  });

  if (validFiles.length === 0) {
    console.log("No valid files in this batch");
    return;
  }

  // Process vectors in parallel for this batch
  const vectorPromises = validFiles.map(async (item) => {
    try {
      const url = item.relativePath.replace("webusers/webusers/", "");
      const entry = entryMap.get(url)!;
      
      const vector = await getImageVector(item.filePath);
      const vectorString = formatVectorForDB(vector.vector);
      
      return {
        entrycode: entry.entrycode,
        vectorString,
        isCover: entry.isCover,
        relativePath: item.relativePath,
      };
    } catch (error) {
      console.error(`Error creating image vector for ${item.relativePath}`, error);
      return null;
    }
  });

  const vectorResults = await Promise.all(vectorPromises);
  const validVectors = vectorResults.filter((result): result is NonNullable<typeof result> => result !== null);

  if (validVectors.length === 0) {
    console.log("No valid vectors generated in this batch");
    return;
  }

  // Batch insert vectors
  try {
    const values = validVectors.map(v => 
      `(${v.entrycode}, VEC_FromText(${v.vectorString}), ${v.isCover})`
    ).join(", ");

    await prismaCoa.$executeRaw`
      INSERT INTO inducks_entryurl_vector (entrycode, v, is_cover)
      VALUES ${values}
    `;

    console.log(`Successfully inserted ${validVectors.length} vectors in batch`);
    
    // Update existing vectors set to avoid reprocessing
    validVectors.forEach(v => {
      existingVectors.push(v.entrycode);
    });
    
  } catch (error) {
    console.error("Error in batch insert:", error);
    
    // Fallback to individual inserts if batch insert fails
    console.log("Falling back to individual inserts...");
    for (const vector of validVectors) {
      try {
        await prismaCoa.$executeRaw`
          INSERT INTO inducks_entryurl_vector (entrycode, v, is_cover)
          VALUES (${vector.entrycode}, VEC_FromText(${vector.vectorString}), ${vector.isCover})
        `;
        console.log(`Added image vector ${vector.entrycode} for ${vector.relativePath}`);
      } catch (insertError) {
        console.error(`Error adding image vector for ${vector.relativePath}`, insertError);
      }
    }
  }
}

for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
  const batch = filesToProcess.slice(i, i + BATCH_SIZE);
  console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filesToProcess.length / BATCH_SIZE)} (${batch.length} files)`);
  
  await processBatch(batch, existingVectors);
}