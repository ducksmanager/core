import "~group-by";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient as PrismaClientCoa } from "./client/client";
import ensureConnectionString from "~ensure-connection-string";

import prismaExtendedCoa from "./extended";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getCoaClient> | null = null;

let coaClient: ReturnType<typeof prismaExtendedCoa> | null = null;

const getCoaClient = () => {
  if (!coaClient) {
    try {
      console.log("Creating new COA PrismaClient instance");
      const connectionString = ensureConnectionString(
        process.env.DATABASE_URL!,
      );
      console.log("COA connection string configured with pool parameters");
      coaClient = prismaExtendedCoa(
        new PrismaClientCoa({
          adapter: new PrismaMariaDb(connectionString),
          log: process.env.NODE_ENV === "local" ? ["error", "warn"] : ["error"],
        }),
      );
    } catch (error) {
      console.error("Failed to create COA PrismaClient:", error);
      throw error;
    }
  }
  return coaClient;
};
export const prismaClient = new Proxy({} as ReturnType<typeof getCoaClient>, {
  get(_target, prop) {
    if (!_prismaClient) {
      _prismaClient = getCoaClient();
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

export * from "./extended";
