import { Queue } from "bullmq";

import { bullConnection, createRedisClient } from "./connection";

export const INDEXATION_AI_QUEUE = "indexation-ai";

export type IndexationAiJobData = {
  indexationId: string;
  userId: number;
};

const jobOptions = {
  jobId: undefined,
  removeOnComplete: true,
  removeOnFail: true,
} as const;

const dirtyKey = (indexationId: string) => `indexation-ai:dirty:${indexationId}`;

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

export const enqueueIndexationAi = async (
  indexationId: string,
  userId: number,
) => {
  await redis.set(dirtyKey(indexationId), "1");
  await addJob(indexationId, userId);
};

export const markProcessingStarted = (indexationId: string) =>
  redis.getdel(dirtyKey(indexationId));

export const requeueIfDirty = async (indexationId: string, userId: number) => {
  const dirty = await redis.getdel(dirtyKey(indexationId));
  if (dirty) {
    await addJob(indexationId, userId);
  }
};
