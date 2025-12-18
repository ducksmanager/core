import ensureConnectionString from "~ensure-connection-string";
import { PrismaClient } from "./client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let client: PrismaClient | null = null;
export const getClient = () => {
  if (!client) {
    console.log("Creating new CoverInfo PrismaClient instance");
    const connectionString = ensureConnectionString(
      process.env.DATABASE_URL_COVER_INFO!,
    );
    client = new PrismaClient({
      adapter: new PrismaMariaDb(connectionString),
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
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
