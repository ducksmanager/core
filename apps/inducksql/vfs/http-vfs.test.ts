#!/usr/bin/env bun

/**
 * Runs the range-request VFS against a real HTTP server serving the real artifact, and checks
 * both that results match a direct local read and how many bytes each query actually costs.
 */

import { Database } from "bun:sqlite";
import { statSync } from "fs";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import { installHttpVfs, type RangeSource } from "./http-vfs";

const file = process.argv[2] ?? "coa.sqlite";
const blockSize = Number(process.argv[3] ?? 64 * 1024);
const size = statSync(file).size;

// The server runs in its own process: the transport below blocks this event loop, so a
// same-process server could never answer it (that deadlock is easy to hit and hard to read).
// process.execPath, not "bun": a shimmed `bun` on PATH may not resolve inside a spawn.
const server = Bun.spawn(
  [process.execPath, `${import.meta.dir}/range-server.ts`, file, "0"],
  { stdout: "pipe", stderr: "inherit" },
);
const reader = server.stdout.getReader();
const ready = await Promise.race([
  reader
    .read()
    .then(({ value }) => new TextDecoder().decode(value).trim().split(" ")),
  new Promise<string[]>((_, reject) =>
    setTimeout(
      () => reject(new Error("server did not report READY within 15s")),
      15_000,
    ),
  ),
]);
if (ready[0] !== "READY")
  throw new Error(`server failed to start: ${ready.join(" ")}`);
const url = `http://localhost:${ready[1]}/${file}`;
console.log(
  `serving ${file} (${(size / 1024 ** 2).toFixed(0)} MB) at ${url}, blockSize ${blockSize / 1024} KB\n`,
);

/**
 * Bun stand-in for createXhrSource: same contract and same real HTTP, but synchronous via
 * spawnSync since Bun has no XMLHttpRequest. The browser uses sync XHR instead.
 */
const createSyncHttpSource = (target: string): RangeSource => ({
  size,
  read(offset, length) {
    const { stdout, exitCode } = Bun.spawnSync([
      "curl",
      "-sS",
      "--fail",
      "-r",
      `${offset}-${offset + length - 1}`,
      target,
    ]);
    if (exitCode !== 0)
      throw new Error(`curl failed for ${length}B at ${offset}`);
    return new Uint8Array(stdout);
  },
});

const sqlite3 = await sqlite3InitModule();
const source = createSyncHttpSource(url);
const { stats } = installHttpVfs(sqlite3, {
  resolve: (path) => (path.endsWith(file) || path === file ? source : null),
  blockSize,
});

const db = new sqlite3.oo1.DB({ filename: file, flags: "r", vfs: "http" });
const local = new Database(file, { readonly: true });

const probe = local
  .query<{ entrycode: string; issuecode: string }, []>(
    "SELECT entrycode, issuecode FROM inducks_entry WHERE issuecode <> '' LIMIT 1",
  )
  .get()!;
const storycode = local
  .query<{ storycode: string }, []>(
    "SELECT storycode FROM inducks_storyversion WHERE storycode <> '' LIMIT 1",
  )
  .get()!.storycode;

const queries: [string, string, (string | number)[]][] = [
  ["count countries", "SELECT COUNT(*) AS n FROM inducks_country", []],
  [
    "issue -> entries",
    "SELECT entrycode, title FROM inducks_entry WHERE issuecode = ? ORDER BY position",
    [probe.issuecode],
  ],
  [
    "story -> publications",
    `SELECT DISTINCT e.issuecode AS issuecode FROM inducks_storyversion sv
     JOIN inducks_entry e ON e.storyversioncode = sv.storyversioncode
     WHERE sv.storycode = ? ORDER BY e.issuecode`,
    [storycode],
  ],
  [
    "entryurl by entrycode",
    "SELECT sitecode, url FROM inducks_entryurl WHERE entrycode = ? ORDER BY sitecode, url",
    [probe.entrycode],
  ],
  [
    "FTS5 search",
    `WITH m AS MATERIALIZED (
       SELECT rowid AS rid, bm25(inducks_entry_fts) AS bm
       FROM inducks_entry_fts WHERE inducks_entry_fts MATCH ? LIMIT 50
     )
     SELECT e.title AS title FROM m JOIN inducks_entry e ON e.rowid = m.rid
     ORDER BY m.bm, e.title LIMIT 10`,
    ["noel"],
  ],
];

let failures = 0;
console.log(
  `${"query".padEnd(24)}${"rows".padStart(6)}${"requests".padStart(10)}${"fetched".padStart(11)}  match`,
);
for (const [label, sql, args] of queries) {
  const before = { ...stats };
  const remote: unknown[] = [];
  db.exec({
    sql,
    bind: args.length ? args : undefined,
    rowMode: "object",
    callback: (row: unknown) => void remote.push(row),
  });
  const expected = local.query(sql).all(...(args as never[]));

  const match = JSON.stringify(remote) === JSON.stringify(expected);
  if (!match) failures++;
  const requests = stats.rangeRequests - before.rangeRequests;
  const fetched = stats.bytesFetched - before.bytesFetched;
  console.log(
    `${label.padEnd(24)}${String(remote.length).padStart(6)}${String(requests).padStart(10)}${(fetched / 1024).toFixed(0).padStart(9)} KB  ${match ? "OK" : "MISMATCH"}`,
  );
  if (!match) {
    console.error(`   remote:   ${JSON.stringify(remote).slice(0, 200)}`);
    console.error(`   expected: ${JSON.stringify(expected).slice(0, 200)}`);
  }
}

console.log(
  `\ntotals: ${stats.rangeRequests} range requests, ` +
    `${(stats.bytesFetched / 1024).toFixed(0)} KB fetched of ${(size / 1024 ** 2).toFixed(0)} MB ` +
    `(${((stats.bytesFetched / size) * 100).toFixed(3)}% of the file), ` +
    `cache ${stats.blockHits} hits / ${stats.blockMisses} misses`,
);

db.close();
local.close();
server.kill();
if (failures) {
  console.error(`\n${failures} query/queries did not match`);
  process.exit(1);
}
console.log("all queries matched the local database");
