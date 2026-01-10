import "~group-by";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient as PrismaClientEdgeCreator } from "./client/client";
import ensureConnectionString from "~ensure-connection-string";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getClient> | null = null;

let edgeCreatorClient: PrismaClientEdgeCreator | null = null;

const getClient = () => {
  if (!edgeCreatorClient) {
    try {
      console.log("Creating new EdgeCreator PrismaClient instance");
      const connectionString = ensureConnectionString(
        process.env.DATABASE_URL!,
      );
      console.log(
        "EdgeCreator connection string configured with pool parameters",
      );
      edgeCreatorClient = new PrismaClientEdgeCreator({
        adapter: new PrismaMariaDb(connectionString),
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    } catch (error) {
      console.error("Failed to create EdgeCreator PrismaClient:", error);
      throw error;
    }
  }
  return edgeCreatorClient;
};
export const prismaClient = new Proxy({} as ReturnType<typeof getClient>, {
  get(_target, prop) {
    if (!_prismaClient) {
      _prismaClient = getClient();
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

export * from "./client/client";
