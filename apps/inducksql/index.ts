#!/usr/bin/env bun
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import { Database } from "bun:sqlite";
import { parseArgs } from "util";
import { createPool } from "mariadb";
import { existsSync, rmSync, statSync } from "fs";

import { ftsIndexes } from "./config";
import { introspect } from "./introspect";
import {
  createFtsIndex,
  createIndexes,
  createTable,
  quote,
} from "./sqlite-schema";

const { values: options } = parseArgs({
  options: {
    out: { type: "string", default: "coa.sqlite" },
    "page-size": { type: "string", default: "8192" },
    "enum-checks": { type: "boolean", default: false },
    "no-indexes": { type: "boolean", default: false },
    "no-fts": { type: "boolean", default: false },
    only: { type: "string" },
    // `turso db upload` rejects anything that is not WAL; sqlite-wasm's OPFS importer rewrites
    // the header to force WAL off. Pass --journal-mode=wal for Turso, leave it for the browser.
    "journal-mode": { type: "string", default: "delete" },
  },
});

const host = process.env.MYSQL_HOST,
  password = process.env.MYSQL_ROOT_PASSWORD,
  database = process.env.MYSQL_DATABASE,
  port = parseInt(process.env.MYSQL_PORT || "3306");

if (!host || password === undefined || !database) {
  throw new Error(
    "MYSQL_HOST, MYSQL_ROOT_PASSWORD and MYSQL_DATABASE are required",
  );
}

const mb = (path: string) => (statSync(path).size / 1024 ** 2).toFixed(1);
const since = (start: number) => `${((Date.now() - start) / 1000).toFixed(1)}s`;

const pool = createPool({
  host,
  port,
  user: "root",
  password,
  database,
  connectionLimit: 2,
  // Row values reach SQLite as-is; only DATE/DATETIME needs normalising (see toSqlite).
  bigIntAsNumber: true,
  sessionVariables: { net_read_timeout: 1800, net_write_timeout: 1800 },
});

/** SQLite has no date or boolean storage class, so dates become sortable ISO-8601 text. */
const toSqlite = (value: unknown) => {
  if (value instanceof Date)
    return value.toISOString().replace("T", " ").replace("Z", "");
  if (Buffer.isBuffer(value)) return value.toString("utf8");
  if (typeof value === "boolean") return value ? 1 : 0;
  return value as string | number | null;
};

// Streaming needs a dedicated connection: queryStream is a Connection-level API.
const streamConnection = await pool.getConnection();

try {
  const tables = (await introspect(pool, database)).filter(
    (table) => !options.only || options.only.split(",").includes(table.name),
  );
  console.log(`${tables.length} tables to export from ${database}`);

  for (const suffix of ["", "-wal", "-shm"]) {
    if (existsSync(options.out + suffix)) rmSync(options.out + suffix);
  }

  const sqlite = new Database(options.out, { create: true, strict: false });
  // Durability is pointless for a build artifact that is regenerated from scratch.
  sqlite.run(`PRAGMA page_size = ${parseInt(options["page-size"])}`);
  sqlite.run("PRAGMA journal_mode = OFF");
  sqlite.run("PRAGMA synchronous = OFF");
  sqlite.run("PRAGMA cache_size = -200000");
  sqlite.run("PRAGMA temp_store = MEMORY");

  for (const table of tables) {
    sqlite.run(createTable(table, options["enum-checks"]));
  }

  const dataStart = Date.now();
  let totalRows = 0;
  for (const table of tables) {
    const start = Date.now();
    const columns = table.columns.map(({ name }) => name);
    const insert = sqlite.prepare(
      `INSERT INTO ${quote(table.name)} VALUES (${columns.map(() => "?").join(", ")})`,
    );
    const select = `SELECT ${columns.map((name) => `\`${name}\``).join(", ")} FROM \`${table.name}\``;

    let rows = 0;
    // Batches keep each transaction bounded while still amortising the write cost.
    let batch: unknown[][] = [];
    const flush = sqlite.transaction((pending: unknown[][]) => {
      for (const row of pending) insert.run(...(row as never[]));
    });

    const stream = streamConnection.queryStream(select);
    for await (const row of stream) {
      batch.push(
        columns.map((name) => toSqlite((row as Record<string, unknown>)[name])),
      );
      if (batch.length === 20_000) {
        flush(batch);
        rows += batch.length;
        batch = [];
      }
    }
    if (batch.length) {
      flush(batch);
      rows += batch.length;
    }

    totalRows += rows;
    if (rows > 50_000) {
      console.log(
        `  ${table.name.padEnd(42)} ${rows.toLocaleString().padStart(11)} rows  ${since(start)}`,
      );
    }
  }
  console.log(
    `data: ${totalRows.toLocaleString()} rows in ${since(dataStart)} (${mb(options.out)} MB)`,
  );

  if (!options["no-indexes"]) {
    const start = Date.now();
    const statements = tables.flatMap(createIndexes);
    for (const statement of statements) sqlite.run(statement);
    console.log(
      `indexes: ${statements.length} in ${since(start)} (${mb(options.out)} MB)`,
    );
  }

  if (!options["no-fts"]) {
    for (const [table, columns] of Object.entries(ftsIndexes)) {
      if (!tables.some(({ name }) => name === table)) continue;
      const start = Date.now();
      for (const statement of createFtsIndex(table, columns))
        sqlite.run(statement);
      console.log(
        `fts5 ${table}(${columns.join(",")}): ${since(start)} (${mb(options.out)} MB)`,
      );
    }
  }

  sqlite.run("PRAGMA optimize");
  const vacuumStart = Date.now();
  sqlite.run("VACUUM");
  console.log(`vacuum: ${since(vacuumStart)}`);

  // Set last: VACUUM and the bulk load both run fastest without a journal, and the mode the
  // artifact ships with only matters to whatever consumes it.
  const journalMode = options["journal-mode"];
  const applied = sqlite
    .query<{ journal_mode: string }, []>(`PRAGMA journal_mode = ${journalMode}`)
    .get()!.journal_mode;
  if (applied.toLowerCase() !== journalMode.toLowerCase()) {
    throw new Error(
      `journal_mode ${journalMode} was not applied (got ${applied})`,
    );
  }
  console.log(`journal_mode: ${applied}`);

  const { integrity_check } = sqlite
    .query<{ integrity_check: string }, []>("PRAGMA integrity_check")
    .get()!;
  if (integrity_check !== "ok") {
    throw new Error(`integrity_check failed: ${integrity_check}`);
  }
  // WAL mode leaves -wal/-shm sidecars behind. Fold them into the main file so the artifact
  // stays a single uploadable file.
  if (applied.toLowerCase() === "wal") {
    sqlite.run("PRAGMA wal_checkpoint(TRUNCATE)");
  }
  sqlite.close();
  for (const suffix of ["-wal", "-shm"]) {
    if (existsSync(options.out + suffix)) rmSync(options.out + suffix);
  }

  console.log(
    `\n=> ${options.out}  ${mb(options.out)} MB  (${tables.length} tables, integrity ok)`,
  );
} finally {
  await streamConnection.release();
  await pool.end();
}
