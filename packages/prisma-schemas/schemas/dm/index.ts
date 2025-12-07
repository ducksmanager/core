import "~group-by";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient as PrismaClientDm } from "./client/client";
import ensureConnectionString from "~ensure-connection-string";

import prismaExtendedDm from "./extended";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getDmClient> | null = null;

let dmClient: ReturnType<typeof prismaExtendedDm> | null = null;

const getDmClient = () => {
  if (!dmClient) {
    try {
      console.log("Creating new DM PrismaClient instance");
      const connectionString = ensureConnectionString(
        process.env.DATABASE_URL_DM!,
      );
      console.log("DM connection string configured with pool parameters");
      dmClient = prismaExtendedDm(
        new PrismaClientDm({
          adapter: new PrismaMariaDb(connectionString),
          log:
            process.env.NODE_ENV === "development"
              ? ["error", "warn"]
              : ["error"],
        }),
      );
    } catch (error) {
      console.error("Failed to create DM PrismaClient:", error);
      throw error;
    }
  }
  return dmClient;
};
export const prismaClient = new Proxy({} as ReturnType<typeof getDmClient>, {
  get(_target, prop) {
    if (!_prismaClient) {
      _prismaClient = getDmClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  },
});

process.on("beforeExit", async () => {
  await prismaClient.$disconnect();
});

process.on("SIGINT", async () => {
  await prismaClient.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prismaClient.$disconnect();
  process.exit(0);
});
