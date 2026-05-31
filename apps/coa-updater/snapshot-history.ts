import type { Pool, PoolConnection } from "mariadb";

export const DEFAULT_SKIP_TABLES = ["inducks_entryurl_vector"] as const;

const qIdent = (name: string) => `\`${name.replace(/`/g, "``")}\``;

export const assertSafeSnapshotDate = (snapshotDate: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) {
    throw new Error(`Invalid snapshot_date (expected YYYY-MM-DD): ${snapshotDate}`);
  }
};

/** One schema per backup, e.g. coa → coa_hist_2026_05_03 */
export const snapshotSchemaForDate = (snapshotDate: string) => {
  assertSafeSnapshotDate(snapshotDate);
  return `coa_hist_${snapshotDate.replace(/-/g, "_")}`;
};

const schemaExists = (conn: PoolConnection, schema: string) =>
  conn.query<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.schemata WHERE schema_name = ?`,
    [schema],
  ).then((rows) => Number(rows[0]?.c ?? 0) > 0);

const tableExists = (
  conn: PoolConnection,
  schema: string,
  table: string,
) => conn.query<{ c: bigint }[]>(
    `SELECT COUNT(*) AS c FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [schema, table],
  ).then((rows) => Number(rows[0]?.c ?? 0) > 0);

const listLiveColumns = (
  conn: PoolConnection,
  schema: string,
  table: string,
) => conn.query<{ COLUMN_NAME: string }[]>(
    `SELECT COLUMN_NAME FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ?
     ORDER BY ORDINAL_POSITION`,
    [schema, table],
  ).then((rows) => rows.map((r) => r.COLUMN_NAME));

const dropForeignKeys = (
  conn: PoolConnection,
  schema: string,
  table: string,
) => conn.query<{ CONSTRAINT_NAME: string }[]>(
    `SELECT CONSTRAINT_NAME FROM information_schema.table_constraints
     WHERE table_schema = ? AND table_name = ? AND constraint_type = 'FOREIGN KEY'`,
    [schema, table],
  ).then((rows) => Promise.all(rows.map((r) => conn.query(
    `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} DROP FOREIGN KEY ${qIdent(r.CONSTRAINT_NAME)}`
  )))
);

/** Drop UNIQUE indexes (except PRIMARY); keeps non-unique indexes including FULLTEXT. */
const dropUniqueSecondaryIndexes = (
  conn: PoolConnection,
  schema: string,
  table: string,
) => conn.query<{ INDEX_NAME: string }[]>(
    `SELECT DISTINCT INDEX_NAME FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ?
       AND INDEX_NAME <> 'PRIMARY' AND NON_UNIQUE = 0`,
    [schema, table],
  ).then((rows) => Promise.all(rows.map((r) => conn.query(
    `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} DROP INDEX ${qIdent(r.INDEX_NAME)}`
  ))));

const ensureSnapshotTable = async (
  conn: PoolConnection,
  liveDb: string,
  snapshotDb: string,
  table: string,
) => {
  if (await tableExists(conn, snapshotDb, table)) return;

  console.log(
    `  [snapshot] creating ${snapshotDb}.${table} from ${liveDb}.${table}...`,
  );

  await conn.query(
    `CREATE TABLE ${qIdent(snapshotDb)}.${qIdent(table)} LIKE ${qIdent(liveDb)}.${qIdent(table)}`,
  );

  await dropForeignKeys(conn, snapshotDb, table);
  await dropUniqueSecondaryIndexes(conn, snapshotDb, table);
};

const copyTableFromLive = async (
  conn: PoolConnection,
  liveDb: string,
  snapshotDb: string,
  table: string,
) => {
  const liveCols = await listLiveColumns(conn, liveDb, table);
  if (!liveCols.length) {
    console.warn(`  [snapshot] skip empty schema ${liveDb}.${table}`);
    return 0;
  }

  const colsSql = liveCols.map(qIdent).join(", ");

  const result = await conn.query(
    `INSERT INTO ${qIdent(snapshotDb)}.${qIdent(table)} (${colsSql})
     SELECT ${colsSql} FROM ${qIdent(liveDb)}.${qIdent(table)}`,
  );

  const affected =
    typeof result === "object" &&
    result !== null &&
    "affectedRows" in result &&
    typeof (result as { affectedRows: unknown }).affectedRows === "number"
      ? (result as { affectedRows: number }).affectedRows
      : 0;

  return affected;
};

export type SnapshotIntoDatedSchemaOptions = {
  liveDatabase: string;
  snapshotDate: string;
  skipTables?: readonly string[];
  /**
   * When true (default), drops an existing dated schema and recreates it.
   * Use false only if you need to avoid clobbering an existing schema.
   */
  replaceExisting?: boolean;
};

/**
 * Copies live COA (`inducks*` tables) into a dedicated schema `coa_hist_YYYY_MM_DD`
 * (same layout as live — no snapshot_date column).
 */
export const snapshotLiveCoaIntoDatedSchema = async (
  pool: Pool,
  options: SnapshotIntoDatedSchemaOptions,
) => {
  const skip = new Set([
    ...DEFAULT_SKIP_TABLES,
    ...(options.skipTables ?? []),
  ]);

  const snapshotDb = snapshotSchemaForDate(options.snapshotDate);
  const replaceExisting = options.replaceExisting !== false;

  const conn = await pool.getConnection();
  try {
    await conn.query("SET SESSION net_read_timeout = 7200");
    await conn.query("SET SESSION net_write_timeout = 7200");
    await conn.query("SET SESSION wait_timeout = 28800");

    const tableRows = await conn.query<{ TABLE_NAME: string }[]>(
      `SELECT TABLE_NAME FROM information_schema.tables
       WHERE table_schema = ? ORDER BY TABLE_NAME`,
      [options.liveDatabase],
    );

    const tables = tableRows
      .map((r) => r.TABLE_NAME)
      .filter((t) => t.startsWith("inducks"))
      .filter((t) => !skip.has(t));

    if (!tables.length) {
      throw new Error(
        `[snapshot] No live COA tables were found in ${options.liveDatabase}. ` +
          "Refusing to continue; check MYSQL_HOST points to the intended db container.",
      );
    }

    if (!replaceExisting && (await schemaExists(conn, snapshotDb))) {
      throw new Error(
        `[snapshot] Schema ${snapshotDb} already exists and replaceExisting=false; refusing to overwrite.`,
      );
    }

    console.log(
      `[snapshot] ${options.snapshotDate}: copying ${tables.length} tables from ${options.liveDatabase} → ${snapshotDb}`,
    );

    if (replaceExisting) {
      await conn.query(`DROP DATABASE IF EXISTS ${qIdent(snapshotDb)}`);
    }

    await conn.query(
      `CREATE DATABASE ${qIdent(snapshotDb)}
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    await conn.query("SET foreign_key_checks = 0");
    await conn.query("SET unique_checks = 0");

    try {
      for (const table of tables) {
        if (!(await tableExists(conn, options.liveDatabase, table))) {
          console.warn(`  [snapshot] skip missing live table ${table}`);
          continue;
        }

        await ensureSnapshotTable(conn, options.liveDatabase, snapshotDb, table);

        const n = await copyTableFromLive(
          conn,
          options.liveDatabase,
          snapshotDb,
          table,
        );
        console.log(`  [snapshot] ${table}: ${n} rows`);
      }
    } finally {
      await conn.query("SET unique_checks = 1");
      await conn.query("SET foreign_key_checks = 1");
    }

    console.log(`[snapshot] ${options.snapshotDate} complete → ${snapshotDb}`);
  } finally {
    conn.release();
  }
};

export const datedSnapshotSchemaExists = async (
  pool: Pool,
  snapshotDate: string,
) => {
  const schema = snapshotSchemaForDate(snapshotDate);
  const conn = await pool.getConnection();
  try {
    return schemaExists(conn, schema);
  } finally {
    conn.release();
  }
};
