import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from "./client_dumili/client";
const getDumiliClient = () => new PrismaClient(
    {
      adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }
  );

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getDumiliClient> | null = null;

export default new Proxy({} as ReturnType<typeof getDumiliClient>, {
  get(_target, prop) {
    if (!_prismaClient) {
      _prismaClient = getDumiliClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  },
});
