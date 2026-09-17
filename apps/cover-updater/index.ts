#!/usr/bin/env bun

import { importCovers } from "./import-covers";
import { deleteNonIndexedCovers, processCovers } from "./process-covers";
import { errorMessage } from "./util";

await importCovers();

// A failed cleanup must never hold up the import of new covers.
try {
  await deleteNonIndexedCovers();
} catch (error) {
  console.warn(`WARNING: cover cleanup failed: ${errorMessage(error)}`);
}

await processCovers();

process.exit(0);
