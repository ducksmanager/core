import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient as PrismaClientDuckguessr } from "./client_duckguessr/client";

let prismaClient: PrismaClientDuckguessr | null = null;

const getDuckguessrClient = () => {
  if (!prismaClient) {
    try {
      console.log("Creating new Duckguessr PrismaClient instance");
      prismaClient = new PrismaClientDuckguessr({
        adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    } catch (error) {
      console.error("Failed to create Duckguessr PrismaClient:", error);
      throw error;
    }
  }
  return prismaClient;
};

export default getDuckguessrClient();
