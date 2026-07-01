import type { ConnectionOptions } from "bullmq";
import { Redis, type RedisOptions } from "ioredis";

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const createRedisClient = (options?: RedisOptions) =>
  options ? new Redis(REDIS_URL, options) : new Redis(REDIS_URL);

// Connection options for BullMQ. We pass options (not an ioredis instance) so
// BullMQ instantiates its own connection with its bundled ioredis, avoiding
// type/instance mismatches between multiple ioredis copies. BullMQ also requires
// `maxRetriesPerRequest: null` on its connections.
export const bullConnection: ConnectionOptions = (() => {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };
})();
