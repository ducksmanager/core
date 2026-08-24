import { ref, shallowRef } from "vue";

import type {
  ColumnInfo,
  QueryResult,
  Request,
  Response,
  SchemaObject,
  TransferStats,
} from "./protocol";

const url = import.meta.env.VITE_DB_URL ?? "http://localhost:8901/coa.sqlite";

const worker = new Worker(new URL("./db.worker.ts", import.meta.url), {
  type: "module",
});

let nextId = 0;
const pending = new Map<
  number,
  { resolve: (value: Response) => void; reject: (error: Error) => void }
>();

export const stats = ref<TransferStats>({
  rangeRequests: 0,
  bytesFetched: 0,
  blockHits: 0,
  blockMisses: 0,
});
export const status = ref<"connecting" | "ready" | "error">("connecting");
export const error = ref<string | null>(null);
export const info = ref<{ sizeBytes: number; pageSize: number } | null>(null);
export const schema = shallowRef<SchemaObject[]>([]);

worker.onmessage = (event: MessageEvent<Response>) => {
  const message = event.data;
  if (message.id === -1) {
    if (message.ok && message.kind === "stats") stats.value = message.stats;
    return;
  }
  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  if (message.ok) entry.resolve(message);
  else entry.reject(new Error(message.error));
};

/**
 * Omit collapses a discriminated union, so it has to be applied through a naked type parameter
 * for the conditional type to distribute over each member.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
type PendingRequest = DistributiveOmit<Request, "id">;

const send = (request: PendingRequest) =>
  new Promise<Response>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    worker.postMessage({ ...request, id } as Request);
  });

export const connect = async () => {
  try {
    const opened = await send({ kind: "open", url });
    if (!opened.ok || opened.kind !== "open") throw new Error("open failed");
    info.value = { sizeBytes: opened.sizeBytes, pageSize: opened.pageSize };
    const loaded = await send({ kind: "schema" });
    if (loaded.ok && loaded.kind === "schema") schema.value = loaded.objects;
    status.value = "ready";
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught);
    status.value = "error";
  }
};

export const columnsOf = async (table: string): Promise<ColumnInfo[]> => {
  const response = await send({ kind: "columns", table });
  return response.ok && response.kind === "columns" ? response.columns : [];
};

export const runQuery = async (
  sql: string,
  limit?: number,
): Promise<QueryResult> => {
  const response = await send({ kind: "query", sql, limit });
  if (!response.ok || response.kind !== "query")
    throw new Error("query failed");
  return response.result;
};

export const databaseUrl = url;
