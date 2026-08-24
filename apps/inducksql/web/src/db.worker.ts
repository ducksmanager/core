/// <reference lib="webworker" />

/**
 * Owns the SQLite instance. This has to be a Worker: the range-request VFS reads through
 * synchronous XMLHttpRequest, which is only permitted off the main thread.
 */

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import { createXhrSource, installHttpVfs } from "../../vfs/http-vfs";
import type {
  ColumnInfo,
  QueryResult,
  Request,
  Response,
  SchemaObject,
  TransferStats,
} from "./protocol";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
let stats: TransferStats | null = null;

const post = (message: Response) => self.postMessage(message);

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
  db = new sqlite3.oo1.DB({ filename, flags: "r", vfs: "http" });
  return {
    sizeBytes: source.size,
    pageSize: Number(db.selectValue("PRAGMA page_size")),
  };
};

const rows = (sql: string, bind?: unknown[]) => {
  const out: unknown[][] = [];
  let columns: string[] = [];
  db.exec({
    sql,
    bind,
    rowMode: "array",
    columnNames: (columns = []),
    callback: (row: unknown[]) => void out.push(row),
  });
  return { columns, rows: out };
};

const runQuery = (sql: string, limit?: number): QueryResult => {
  // The plan is read first so the UI can warn before a SCAN pulls a whole table over the wire.
  let plan: string[] = [];
  try {
    plan = rows(`EXPLAIN QUERY PLAN ${sql}`).rows.map((row) => String(row[3]));
  } catch {
    plan = [];
  }

  const before = snapshot();
  const started = performance.now();
  const wrapped =
    limit && !/\blimit\b/i.test(sql)
      ? `SELECT * FROM (${sql.replace(/;\s*$/, "")}) LIMIT ${limit}`
      : sql;
  const result = rows(wrapped);
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
        const objects = rows(
          `SELECT type, name, tbl_name, sql FROM sqlite_master
           WHERE name NOT LIKE 'sqlite_%' ORDER BY tbl_name, type DESC, name`,
        ).rows.map((row): SchemaObject => ({
          type: row[0] as SchemaObject["type"],
          name: row[1] as string,
          tableName: row[2] as string,
          sql: row[3] as string | null,
        }));
        post({ id: request.id, ok: true, kind: "schema", objects });
        break;
      }
      case "columns": {
        const columns = rows(
          `SELECT name, type, "notnull", pk FROM pragma_table_info(?)`,
          [request.table],
        ).rows.map((row): ColumnInfo => ({
          name: row[0] as string,
          type: row[1] as string,
          notnull: Number(row[2]),
          pk: Number(row[3]),
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
