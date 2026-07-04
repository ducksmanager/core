import type { ConnectionOptions } from "bullmq";
import { Redis, type RedisOptions } from "ioredis";

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redisUrl = new URL(REDIS_URL);

export const createRedisClient = (options?: RedisOptions) =>
  options ? new Redis(REDIS_URL, options) : new Redis(REDIS_URL);

export const bullConnection: ConnectionOptions = (() => ({
  host: redisUrl.hostname,
  port: redisUrl.port ? Number(redisUrl.port) : 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
}))();
