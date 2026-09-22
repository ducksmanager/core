#!/usr/bin/env bun

import { importCovers } from "./import-covers";
import { fetchIndexedCoverIds, pastecIndexHost, writeIndex } from "./pastec";
import {
  deleteNonIndexedCovers,
  processCovers,
  recordAlreadyIndexedCovers,
} from "./process-covers";
import { errorMessage } from "./util";

await importCovers();

// Read once and share: the backfill and the cleanup are inverses of each other,
// so they must judge the DB against the same view of the index.
const indexedCoverIds = await fetchIndexedCoverIds();

if (indexedCoverIds) {
  try {
    await recordAlreadyIndexedCovers(indexedCoverIds);
  } catch (error) {
    console.warn(`WARNING: index backfill failed: ${errorMessage(error)}`);
  }

  // A failed cleanup must never hold up the import of new covers.
  try {
    await deleteNonIndexedCovers(indexedCoverIds);
  } catch (error) {
    console.warn(`WARNING: cover cleanup failed: ${errorMessage(error)}`);
  }
} else {
  console.warn("Skipping index backfill and cover cleanup");
}

const { importedCount } = await processCovers();

let exitCode = 0;
if (importedCount) {
  const error = await writeIndex();
  if (error) {
    console.error(
      `ERROR: ${pastecIndexHost} did not persist the index, this run's ${importedCount} covers will be lost on the next restart: ${error}`,
    );
    exitCode = 1;
  } else {
    console.log(`Index written to disk by ${pastecIndexHost}`);
  }
}

process.exit(exitCode);
