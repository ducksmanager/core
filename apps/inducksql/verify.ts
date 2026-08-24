#!/usr/bin/env bun

import { Database } from "bun:sqlite";
import { parseArgs } from "util";
import { createPool } from "mariadb";

import { introspect } from "./introspect";
import { quote } from "./sqlite-schema";

const { values: options } = parseArgs({
  options: {
    file: { type: "string", default: "coa.sqlite" },
    sample: { type: "string", default: "200000" },
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

const pool = createPool({
  host,
  port,
  user: "root",
  password,
  database,
  connectionLimit: 2,
  bigIntAsNumber: true,
});
const sqlite = new Database(options.file, { readonly: true });
let failures = 0;

try {
  const tables = await introspect(pool, database);

  // Row counts must agree for every exported table.
  const mismatched: string[] = [];
  for (const { name } of tables) {
    const [{ n }] = await pool.query(`SELECT COUNT(*) AS n FROM \`${name}\``);
    const { n: m } = sqlite
      .query<{ n: number }, []>(`SELECT COUNT(*) AS n FROM ${quote(name)}`)
      .get()!;
    if (Number(n) !== Number(m)) mismatched.push(`${name} (${n} vs ${m})`);
  }
  console.log(
    `row counts: ${tables.length - mismatched.length}/${tables.length} tables match`,
  );
  if (mismatched.length) {
    failures++;
    console.error(`  MISMATCH: ${mismatched.join(", ")}`);
  }

  // Value-level check on the widest text table, where escaping bugs would surface.
  // inducks_entry has no primary key and some entrycodes are duplicated, so rows are aligned by
  // ordering both sides bytewise: MariaDB's default utf8mb3_unicode_ci ordering is
  // accent-insensitive and would interleave rows differently from SQLite's BINARY default.
  const limit = parseInt(options.sample);
  const columns = "entrycode, storyversioncode, title";
  type Row = { entrycode: string; storyversioncode: string; title: string };
  const source: Row[] = await pool.query(
    `SELECT ${columns} FROM inducks_entry
     ORDER BY BINARY entrycode, BINARY storyversioncode, BINARY title LIMIT ${limit}`,
  );
  const exported = sqlite
    .query<Row, []>(
      `SELECT ${columns} FROM inducks_entry
       ORDER BY entrycode, storyversioncode, title LIMIT ${limit}`,
    )
    .all();

  const differing = source.filter((row, index) => {
    const other = exported[index];
    return (
      !other ||
      other.entrycode !== row.entrycode ||
      other.storyversioncode !== row.storyversioncode ||
      other.title !== row.title
    );
  });
  console.log(
    `inducks_entry values: ${source.length - differing.length}/${source.length} rows identical`,
  );
  if (differing.length) {
    failures++;
    const index = source.indexOf(differing[0]);
    console.error(`  first differing at ${index}:`);
    console.error(`    maria:  ${JSON.stringify(source[index])}`);
    console.error(`    sqlite: ${JSON.stringify(exported[index])}`);
  }

  // Titles carrying newlines, tabs or quotes are exactly what a naive CSV/TSV export loses.
  const tricky: { entrycode: string; title: string }[] = await pool.query(
    `SELECT entrycode, title FROM inducks_entry
     WHERE title LIKE '%\\n%' OR title LIKE '%\\t%' OR title LIKE '%"%' LIMIT 5000`,
  );
  // Duplicated entrycodes make a single-row lookup ambiguous, so assert the pair exists.
  const pairExists = sqlite.query<{ n: number }, [string, string]>(
    "SELECT COUNT(*) AS n FROM inducks_entry WHERE entrycode = ? AND title = ?",
  );
  const badTricky = tricky.filter(
    ({ entrycode, title }) => pairExists.get(entrycode, title)!.n === 0,
  );
  console.log(
    `titles with newline/tab/quote: ${tricky.length - badTricky.length}/${tricky.length} preserved`,
  );
  if (badTricky.length) failures++;

  // Accented titles confirm the charset survived the round trip.
  const accented: { entrycode: string; title: string }[] = await pool.query(
    `SELECT entrycode, title FROM inducks_entry
     WHERE title REGEXP '[éèêëàâäôöûüçñ]' LIMIT 5000`,
  );
  const badAccented = accented.filter(
    ({ entrycode, title }) => pairExists.get(entrycode, title)!.n === 0,
  );
  console.log(
    `accented titles: ${accented.length - badAccented.length}/${accented.length} preserved`,
  );
  if (badAccented.length) failures++;

  // NULL and '' mean different things in this schema and must not be conflated.
  for (const [table, column] of [
    ["inducks_entry", "title"],
    ["inducks_storyversion", "storycode"],
    ["inducks_issue", "issuecode"],
  ] as const) {
    const [row] = await pool.query(
      `SELECT SUM(\`${column}\` IS NULL) AS nulls, SUM(\`${column}\` = '') AS empties
       FROM \`${table}\``,
    );
    const other = sqlite
      .query<{ nulls: number; empties: number }, []>(
        `SELECT SUM(${quote(column)} IS NULL) AS nulls,
                SUM(${quote(column)} = '') AS empties FROM ${quote(table)}`,
      )
      .get()!;
    const ok =
      Number(row.nulls) === Number(other.nulls) &&
      Number(row.empties) === Number(other.empties);
    if (!ok) failures++;
    console.log(
      `${table}.${column}: nulls ${row.nulls}/${other.nulls}, empties ${row.empties}/${other.empties} ${ok ? "OK" : "MISMATCH"}`,
    );
  }

  // Views are intentionally absent from the export.
  const views = sqlite
    .query<{ n: number }, []>(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'view'",
    )
    .get()!.n;
  if (views !== 0) failures++;
  console.log(`views in export: ${views} (expected 0)`);
} finally {
  await pool.end();
  sqlite.close();
}

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nall checks passed");
