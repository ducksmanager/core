/** Messages exchanged with the database worker. */

export type TransferStats = {
  rangeRequests: number;
  bytesFetched: number;
  blockHits: number;
  blockMisses: number;
};

export type SchemaObject = {
  type: "table" | "index" | "view" | "trigger";
  name: string;
  tableName: string;
  sql: string | null;
};

export type ColumnInfo = {
  name: string;
  type: string;
  notnull: number;
  pk: number;
};

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
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
