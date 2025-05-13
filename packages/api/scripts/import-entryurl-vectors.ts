import dotenv from "dotenv";
import { Worker } from "worker_threads";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: ".env",
});

import { readdirSync } from "fs";
import type { Dirent } from "fs";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { loadModel } from "../services/story-search";
import type { inducks_entryurl } from "~prisma-schemas/client_coa/client";

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

const cpuCount = os.cpus().length;

// Filter files to process
const filesToProcess = files.filter(
  (file) => !file.isDirectory() && file.parentPath.includes("webusers")
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to detect Bun
const isBun = typeof globalThis.Bun !== "undefined";

// Use .ts for Bun, .mjs for Node
const workerFile = isBun
  ? path.join(__dirname, "get-entryurl-vector.worker.ts")
  : path.join(__dirname, "get-entryurl-vector.worker.mjs");

const runWorker = (filePath: string): Promise<{ vector: number[]; filePath: string } | { error: string; filePath: string }> => new Promise((resolve, reject) => {
  const worker = new Worker(workerFile, {
    workerData: { filePath }
  });
  worker.on("message", (msg) => resolve(msg));
  worker.on("error", reject);
  worker.on("exit", (code) => {
    if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
  });
});

interface FileWithParentPath extends Dirent {
  parentPath: string;
  name: string;
}

const processFile = async (file: FileWithParentPath) => {
  const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;
  const entry = (
    await prismaCoa.$queryRaw<Pick<inducks_entryurl, "entrycode">[]>`
      SELECT entrycode from inducks_entryurl WHERE sitecode='webusers' AND url = ${relativePath.replace("webusers/webusers/", "")}
    `
  )[0];

  if (!entry) {
    console.log(`Entry not found for ${relativePath}`);
    return;
  }

  if (existingVectors.includes(entry.entrycode!)) {
    console.log(`Vector already exists for ${relativePath}`);
    return;
  }

  const filePath = `${file.parentPath}/${file.name}`;
  const result = await runWorker(filePath);

  if ("error" in result) {
    console.error(`Error creating image vector for ${relativePath}: ${result.error}`);
    return;
  }

  const vectorString = `[${result.vector.join(",")}]`;

  try {
    await prismaCoa.$executeRaw`
      INSERT INTO inducks_entryurl_vector (entrycode, v)
      VALUES (${entry.entrycode}, VEC_FromText(${vectorString}))
    `;
    console.log(`Added image vector ${entry.entrycode} for ${relativePath}`);
  } catch (error) {
    console.error(`Error adding image vector for ${relativePath}`, error);
  }
};

const runInParallel = async () => {
  let index = 0;
  let active = 0;

  return new Promise<void>((resolve) => {
    function next() {
      if (index >= filesToProcess.length && active === 0) {
        resolve();
        return;
      }
      while (active < cpuCount && index < filesToProcess.length) {
        const file = filesToProcess[index++];
        active++;
        processFile(file)
          .catch((err) => {
            console.error("Error processing file:", err);
          })
          .finally(() => {
            active--;
            next();
          });
      }
    }
    next();
  });
};

await runInParallel();
