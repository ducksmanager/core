/** Messages exchanged with the database worker. */

import type { SqlValue } from "@sqlite.org/sqlite-wasm";

/**
 * The storage classes SQLite can hand back. Re-exported so the UI does not have to import the
 * driver, and every member survives structured cloning across postMessage.
 */
export type { SqlValue };

/** A const tuple so the worker can validate sqlite_master.type without asserting. */
export const schemaObjectTypes = ["table", "index", "view", "trigger"] as const;

export type SchemaObjectType = (typeof schemaObjectTypes)[number];

export type TransferStats = {
  rangeRequests: number;
  bytesFetched: number;
  blockHits: number;
  blockMisses: number;
};

export type SchemaObject = {
  type: SchemaObjectType;
  name: string;
  tableName: string;
  sql: string | null;
  /** Recorded at export time; null for objects with no recorded count, such as indexes. */
  rowCount: number | null;
};

export type ColumnInfo = {
  name: string;
  type: string;
  notnull: number;
  pk: number;
};

export type QueryResult = {
  columns: string[];
  rows: SqlValue[][];
  /** Query plan lines; a "SCAN" over a large table is ruinous on a range-request VFS. */
  plan: string[];
  elapsedMs: number;
  /** Transfer attributable to this query alone. */
  cost: TransferStats;
};

export type Request =
  | { id: number; kind: "open"; url: string }
  | { id: number; kind: "schema" }
  | { id: number; kind: "columns"; table: string }
  | { id: number; kind: "query"; sql: string; limit?: number };

export type Response =
  | { id: number; ok: true; kind: "open"; sizeBytes: number; pageSize: number }
  | { id: number; ok: true; kind: "schema"; objects: SchemaObject[] }
  | { id: number; ok: true; kind: "columns"; columns: ColumnInfo[] }
  | { id: number; ok: true; kind: "query"; result: QueryResult }
  | { id: number; ok: false; error: string }
  | { id: -1; ok: true; kind: "stats"; stats: TransferStats };
