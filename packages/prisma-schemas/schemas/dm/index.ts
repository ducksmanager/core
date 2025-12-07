import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./client/client";
import ensureConnectionString from "~ensure-connection-string";
import prismaExtendedDm from "./extended";

let client: ReturnType<typeof prismaExtendedDm> | null = null;

const getClient = () => {
  if (!client) {
    try {
      console.log("Creating new DM PrismaClient instance");
      const connectionString = ensureConnectionString(
        process.env.DATABASE_URL_DM!,
      );
      console.log("DM connection string configured with pool parameters");
      client = prismaExtendedDm(
        new PrismaClient({
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
  return client;
};

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getClient> | null = null;
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
