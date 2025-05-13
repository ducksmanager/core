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

import type { inducks_entryurl } from "~prisma-schemas/client_coa/client";

declare global {
  interface ImportMeta {
    dir: string;
  }
}

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

interface FileWithParentPath extends Dirent {
  parentPath: string;
  name: string;
}

const runWorkerPool = async (filesToProcess: FileWithParentPath[]) => new Promise<void>((resolve) => {
  let index = 0;
  const workers: Worker[] = [];
  const busy: boolean[] = Array(cpuCount).fill(false);
  const workerFiles: (FileWithParentPath | null)[] = Array(cpuCount).fill(null);

  const assignWork = (workerIdx: number) => {
    if (index >= filesToProcess.length) {
      // No more files to assign
      if (busy.every((b) => !b)) {
        // All workers are idle, we're done
        workers.forEach((w) => w.terminate());
        resolve();
      }
      return;
    }
    const file = filesToProcess[index++];
    busy[workerIdx] = true;
    workerFiles[workerIdx] = file;
    workers[workerIdx].postMessage({ type: "process", filePath: `${file.parentPath}/${file.name}` });
  };

  for (let i = 0; i < cpuCount; i++) {
    const worker = new Worker(workerFile);
    workers.push(worker);

    worker.on("message", async (msg) => {
      const file = workerFiles[i];
      if (!file) {
        busy[i] = false;
        assignWork(i);
        return;
      }
      const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;
      if (msg.type === "result") {
        // DB insert logic
        const entry = (
          await prismaCoa.$queryRaw<Pick<inducks_entryurl, "entrycode">[]> `
              SELECT entrycode from inducks_entryurl WHERE sitecode='webusers' AND url = ${relativePath.replace("webusers/webusers/", "")}
            `
        )[0];
        if (!entry) {
          console.log(`Entry not found for ${relativePath}`);
        } else if (existingVectors.includes(entry.entrycode!)) {
          console.log(`Vector already exists for ${relativePath}`);
        } else {
          const vectorString = `[${msg.vector.join(",")}]`;
          try {
            await prismaCoa.$executeRaw`
                INSERT INTO inducks_entryurl_vector (entrycode, v)
                VALUES (${entry.entrycode}, VEC_FromText(${vectorString}))
              `;
            console.log(`Added image vector ${entry.entrycode} for ${relativePath}`);
          } catch (error) {
            console.error(`Error adding image vector for ${relativePath}`, error);
          }
        }
      } else if (msg.type === "error") {
        console.error(`Error creating image vector for ${relativePath}: ${msg.error}`);
      }
      busy[i] = false;
      workerFiles[i] = null;
      assignWork(i);
    });

    worker.on("error", (err) => {
      console.error(`Worker error:`, err);
      busy[i] = false;
      workerFiles[i] = null;
      assignWork(i);
    });

    assignWork(i);
  }
});

await runWorkerPool(filesToProcess);
