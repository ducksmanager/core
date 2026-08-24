/// <reference lib="webworker" />

/** Owns the SQLite instance. Must be a Worker: the VFS reads through synchronous XHR. */

import sqlite3InitModule, {
  type BindingSpec,
  type Database,
  type SqlValue,
} from "@sqlite.org/sqlite-wasm";

import { statsTable } from "../../config";
import { createXhrSource, installHttpVfs } from "../../vfs/http-vfs";
import {
  schemaObjectTypes,
  type ColumnInfo,
  type QueryResult,
  type Request,
  type Response,
  type SchemaObject,
  type SchemaObjectType,
  type TransferStats,
} from "./protocol";

let connection: Database | null = null;
let stats: TransferStats | null = null;

const db = (): Database => {
  if (!connection) throw new Error("The database is not open yet");
  return connection;
};

const post = (message: Response) => self.postMessage(message);

const asText = (value: SqlValue): string =>
  typeof value === "string" ? value : value === null ? "" : String(value);

const asNullableText = (value: SqlValue): string | null =>
  value === null ? null : asText(value);

const asNumber = (value: SqlValue): number =>
  typeof value === "number" ? value : Number(asText(value));

const asNullableNumber = (value: SqlValue): number | null =>
  value === null ? null : asNumber(value);

const asSchemaObjectType = (value: SqlValue): SchemaObjectType =>
  schemaObjectTypes.find((candidate) => candidate === value) ?? "table";

const snapshot = (): TransferStats =>
  stats
    ? { ...stats }
    : { rangeRequests: 0, bytesFetched: 0, blockHits: 0, blockMisses: 0 };

const difference = (before: TransferStats, after: TransferStats) => ({
  rangeRequests: after.rangeRequests - before.rangeRequests,
  bytesFetched: after.bytesFetched - before.bytesFetched,
  blockHits: after.blockHits - before.blockHits,
  blockMisses: after.blockMisses - before.blockMisses,
});

const open = async (url: string) => {
  const sqlite3 = await sqlite3InitModule();
  const source = createXhrSource(url);
  const filename = url.split("/").pop() || "database.sqlite";
  ({ stats } = installHttpVfs(sqlite3, {
    resolve: (path) => (path.endsWith(filename) ? source : null),
  }));
  connection = new sqlite3.oo1.DB({ filename, flags: "r", vfs: "http" });
  return {
    sizeBytes: source.size,
    pageSize: asNumber(db().selectValue("PRAGMA page_size") ?? 0),
  };
};

/** exec() fills the array passed as `columnNames`, which is how the header row is recovered. */
const select = (sql: string, bind?: BindingSpec) => {
  const columns: string[] = [];
  const rows = db().exec(sql, {
    rowMode: "array",
    returnValue: "resultRows",
    columnNames: columns,
    bind,
  });
  return { columns, rows };
};

const runQuery = (sql: string, limit?: number): QueryResult => {
  let plan: string[] = [];
  try {
    plan = db()
      .selectObjects(`EXPLAIN QUERY PLAN ${sql}`)
      .map((row) => asText(row.detail));
  } catch {
    plan = [];
  }

  const before = snapshot();
  const started = performance.now();
  const wrapped =
    limit && !/\blimit\b/i.test(sql)
      ? `SELECT * FROM (${sql.replace(/;\s*$/, "")}) LIMIT ${limit}`
      : sql;
  const result = select(wrapped);
  const elapsedMs = performance.now() - started;

  return {
    ...result,
    plan,
    elapsedMs,
    cost: difference(before, snapshot()),
  };
};

self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  try {
    switch (request.kind) {
      case "open": {
        const { sizeBytes, pageSize } = await open(request.url);
        post({ id: request.id, ok: true, kind: "open", sizeBytes, pageSize });
        break;
      }
      case "schema": {
        const objects = db()
          .selectObjects(
            // FTS5 tables and their shadow tables are found from the virtual tables rather than by
            // name, so the filter holds however many the source schema has.
            `WITH fts AS (SELECT name FROM sqlite_master WHERE sql LIKE '%USING fts5%')
             SELECT m.type, m.name, m.tbl_name AS tableName, m.sql, s.row_count AS rowCount
             FROM sqlite_master m
             LEFT JOIN ${statsTable} s ON s.table_name = m.name
             WHERE m.name NOT LIKE 'sqlite_%'
               AND m.name <> '${statsTable}'
               AND NOT EXISTS (
                 SELECT 1 FROM fts
                 WHERE m.name = fts.name
                    OR m.name LIKE fts.name || '\\_%' ESCAPE '\\'
               )
             ORDER BY m.tbl_name, m.type DESC, m.name`,
          )
          .map((row): SchemaObject => ({
            type: asSchemaObjectType(row.type),
            name: asText(row.name),
            tableName: asText(row.tableName),
            sql: asNullableText(row.sql),
            rowCount: asNullableNumber(row.rowCount),
          }));
        post({ id: request.id, ok: true, kind: "schema", objects });
        break;
      }
      case "columns": {
        const columns = db()
          .selectObjects(
            `SELECT name, type, "notnull", pk FROM pragma_table_info(?)`,
            [request.table],
          )
          .map((row): ColumnInfo => ({
            name: asText(row.name),
            type: asText(row.type),
            notnull: asNumber(row.notnull),
            pk: asNumber(row.pk),
          }));
        post({ id: request.id, ok: true, kind: "columns", columns });
        break;
      }
      case "query": {
        const result = runQuery(request.sql, request.limit);
        post({ id: request.id, ok: true, kind: "query", result });
        break;
      }
    }
  } catch (error) {
    post({
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  post({ id: -1, ok: true, kind: "stats", stats: snapshot() });
};
