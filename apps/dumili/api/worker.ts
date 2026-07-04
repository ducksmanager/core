import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});
dotenv.config({
  path: ".env.local",
  override: true,
});

import "~group-by";

import { Emitter } from "@socket.io/redis-emitter";
import { Worker } from "bullmq";
import { getServerSentEvents } from "socket-call-server";

import { bullConnection, createRedisClient } from "./queue/connection";
import {
  INDEXATION_AI_QUEUE,
  type IndexationAiJobData,
  markProcessingStarted,
  requeueIfDirty,
} from "./queue/indexation-ai.queue";
import { runIndexationAi } from "./services/indexation/ai-pipeline";
import {
  fetchFullIndexation,
  type IndexationServerSentStartEndEvents,
} from "./services/indexation/context";

const concurrency = Number(process.env.INDEXATION_AI_CONCURRENCY) || 2;

// Publishes to the same Redis channels the API server's adapter subscribes to,
// so events reach clients connected to the API process.
const emitter = new Emitter(createRedisClient());

const worker = new Worker<IndexationAiJobData>(
  INDEXATION_AI_QUEUE,
  async (job) => {
    const { indexationId, userId } = job.data;
    await markProcessingStarted(indexationId);

    const indexation = await fetchFullIndexation(userId, indexationId);
    if (!indexation) {
      console.warn(
        `Indexation ${indexationId} not found (user ${userId}); skipping AI run`,
      );
      return;
    }

    const events = getServerSentEvents<IndexationServerSentStartEndEvents>(
      emitter.of(`/indexation/${indexationId}`),
    );

    console.log(`Running AI pipeline for indexation ${indexationId}`);
    await runIndexationAi({ events, userId, indexation });
  },
  { connection: bullConnection, concurrency },
);

// Coalescing: if a request arrived while this run was in flight, run once more
// against the now current DB state (the job id is free after removal).
worker.on("completed", (job) => {
  requeueIfDirty(job.data.indexationId, job.data.userId).catch((error) =>
    console.error("Failed to re-enqueue indexation AI job", error),
  );
});

worker.on("failed", (job, error) => {
  console.error(`Indexation AI job failed (${job?.data.indexationId})`, error);
});

console.log(`Dumili indexation AI worker started (concurrency ${concurrency})`);
