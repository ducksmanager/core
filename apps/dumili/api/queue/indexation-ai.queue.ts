import { Queue } from "bullmq";

import { bullConnection, createRedisClient } from "./connection";

export const INDEXATION_AI_QUEUE = "indexation-ai";

export type IndexationAiJobData = {
  indexationId: string;
  userId: number;
};

const jobOptions = {
  jobId: undefined as string | undefined,
  removeOnComplete: true,
  removeOnFail: true,
} as const;

const dirtyKey = (indexationId: string) => `indexation-ai:dirty:${indexationId}`;

// Plain Redis client for the coalescing "dirty" markers (separate from the
// BullMQ connection, which has blocking-command options set).
const redis = createRedisClient();

export const indexationAiQueue = new Queue<IndexationAiJobData>(
  INDEXATION_AI_QUEUE,
  { connection: bullConnection },
);

const addJob = (indexationId: string, userId: number) =>
  indexationAiQueue.add(
    "process",
    { indexationId, userId },
    { ...jobOptions, jobId: indexationId },
  );

// Request an AI run for an indexation.
//
// `jobId = indexationId` means at most one job per indexation exists at a time:
// a second add while one is active/waiting is a no-op. The "dirty" marker set
// here is what makes the coalescing lossless — if this request races an
// in-flight run (so the add is a no-op), the worker will notice the marker when
// the current run finishes and enqueue exactly one more run against the then
// current DB state (see markProcessingStarted / requeueIfDirty).
export const enqueueIndexationAi = async (
  indexationId: string,
  userId: number,
) => {
  await redis.set(dirtyKey(indexationId), "1");
  await addJob(indexationId, userId);
};

// Worker: called at the start of processing. Clears the marker so that only
// requests arriving *during* this run trigger a follow-up run.
export const markProcessingStarted = async (indexationId: string) => {
  await redis.getdel(dirtyKey(indexationId));
};

// Worker: called once the job has completed and been removed. If a request
// arrived during the run, enqueue one more run (the jobId is now free).
export const requeueIfDirty = async (indexationId: string, userId: number) => {
  const dirty = await redis.getdel(dirtyKey(indexationId));
  if (dirty) {
    await addJob(indexationId, userId);
  }
};
