import { prismaClient as prismaCoverInfo } from "~prisma-schemas/schemas/cover_info/client";

import { maxDeletePercent, maxProcessMinutes, pastecHosts } from "./env";
import { addCoverToIndex, pastecIndexHost } from "./pastec";
import { chunk, mapWithConcurrency } from "./util";

const COVERS_ROOT = "/data/covers";
const BATCH_SIZE = 100;
const INSERT_CHUNK_SIZE = 5000;
const CONCURRENCY = 10;
const DELETE_CHUNK_SIZE = 1000;
// cover_imports.import_error is a VARCHAR(200).
const MAX_IMPORT_ERROR_LENGTH = 200;

type PendingCover = { id: number; sitecode: string; url: string };
type CoverImportResult = { id: number; error: string | null };

const coverPath = ({ sitecode, url }: PendingCover) =>
  `${COVERS_ROOT}/${sitecode}/${sitecode === "webusers" ? "webusers/" : ""}${url}`;

const fetchPendingCovers = (batchSize: number) =>
  prismaCoverInfo.$queryRaw<PendingCover[]>`
    SELECT covers.id, covers.sitecode, covers.url
    FROM covers
      LEFT JOIN cover_imports ON cover_imports.coverid = covers.id
    WHERE cover_imports.coverid IS NULL
    LIMIT ${batchSize}`;

const countPendingCovers = () =>
  prismaCoverInfo.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM covers
      LEFT JOIN cover_imports ON cover_imports.coverid = covers.id
    WHERE cover_imports.coverid IS NULL`.then(([row]) => Number(row!.count));

export const recordAlreadyIndexedCovers = async (indexedCoverIds: number[]) => {
  const indexed = new Set(indexedCoverIds);
  const recordedCoverIds = new Set(
    (await prismaCoverInfo.coverImport.findMany({ select: { id: true } })).map(
      ({ id }) => id,
    ),
  );

  const coverIdsToRecord = (
    await prismaCoverInfo.cover.findMany({ select: { id: true } })
  )
    .map(({ id }) => id)
    .filter(
      (coverId) => indexed.has(coverId) && !recordedCoverIds.has(coverId),
    );

  if (!coverIdsToRecord.length) {
    console.log("Index backfill: nothing to record");
    return;
  }

  console.log(
    `Index backfill: recording ${coverIdsToRecord.length} covers that the index already holds`,
  );
  const importedAt = new Date();
  for (const coverIds of chunk(coverIdsToRecord, INSERT_CHUNK_SIZE)) {
    await prismaCoverInfo.coverImport.createMany({
      data: coverIds.map((id) => ({ id, importedAt })),
      skipDuplicates: true,
    });
  }
};

// The index decides what gets deleted, so an index we failed to read must never
// pass for an empty one: the caller skips the cleanup entirely instead. Importing
// a cover again is harmless, deleting one is not.
export const deleteNonIndexedCovers = async (indexedCoverIds: number[]) => {
  const indexed = new Set(indexedCoverIds);
  const importedCoverIds = (
    await prismaCoverInfo.coverImport.findMany({
      select: { id: true },
      where: { importError: null },
    })
  ).map(({ id }) => id);

  const coverIdsToDelete = importedCoverIds.filter(
    (coverId) => !indexed.has(coverId),
  );
  if (!coverIdsToDelete.length) {
    console.log("Cover cleanup: nothing to delete");
    return;
  }

  // A healthy index drifts by a handful of rows, so a proposal to drop a large
  // share of the table means the index was incomplete, not the covers gone.
  const maxDeletable = Math.floor(
    (importedCoverIds.length * maxDeletePercent) / 100,
  );
  if (coverIdsToDelete.length > maxDeletable) {
    console.warn(
      `WARNING: refusing to delete ${coverIdsToDelete.length} of ${importedCoverIds.length} covers (over ${maxDeletePercent}%), the Pastec index at ${pastecIndexHost} looks incomplete`,
    );
    return;
  }

  console.log(
    `Cover cleanup: deleting ${coverIdsToDelete.length} of ${importedCoverIds.length} covers missing from the index`,
  );
  for (const coverIds of chunk(coverIdsToDelete, DELETE_CHUNK_SIZE)) {
    await prismaCoverInfo.coverImport.deleteMany({
      where: { id: { in: coverIds } },
    });
  }
};

const indexCover = async (cover: PendingCover) => {
  const path = coverPath(cover);
  const image = Bun.file(path);

  if (!(await image.exists())) {
    console.log(`Cover ${cover.id}: does not exist locally (${path})`);
    return { id: cover.id, error: "Failed to download" };
  }

  const failures: string[] = [];
  for (const hostAndPort of pastecHosts) {
    const error = await addCoverToIndex(hostAndPort, cover.id, image);
    if (error) {
      failures.push(`${hostAndPort}: ${error}`);
    }
  }

  if (failures.length) {
    const error = failures.join(" ");
    console.log(`Cover ${cover.id}: failed to import, ${error}`);
    return {
      id: cover.id,
      error: error.slice(0, MAX_IMPORT_ERROR_LENGTH),
    } as const;
  }

  console.log(`Cover ${cover.id}: imported into ${pastecHosts.join(", ")}`);
  return { id: cover.id, error: null } as const;
};

const recordResults = (results: CoverImportResult[]) =>
  prismaCoverInfo.coverImport.createMany({
    data: results.map(({ id, error }) => ({
      id,
      importedAt: error ? null : new Date(),
      importError: error,
    })),
    skipDuplicates: true,
  });

export const processCovers = async () => {
  const deadline = Date.now() + maxProcessMinutes * 60_000;
  let processedCount = 0;
  let importedCount = 0;
  let stoppedOnDeadline = false;

  // No offset needed: recording a result gives the cover a cover_imports row,
  // which takes it out of the next batch.
  while (true) {
    if (Date.now() >= deadline) {
      stoppedOnDeadline = true;
      break;
    }

    const covers = await fetchPendingCovers(BATCH_SIZE);
    if (!covers.length) {
      break;
    }

    const results = await mapWithConcurrency(covers, CONCURRENCY, indexCover);
    await recordResults(results);

    processedCount += results.length;
    importedCount += results.filter(({ error }) => !error).length;
  }

  console.log(
    `Processed ${processedCount} covers, ${importedCount} imported into ${pastecHosts.length} Pastec instance(s)`,
  );
  if (stoppedOnDeadline) {
    console.log(
      `Stopped after ${maxProcessMinutes} minutes, ${await countPendingCovers()} covers still pending`,
    );
  }

  return { processedCount, importedCount };
};
