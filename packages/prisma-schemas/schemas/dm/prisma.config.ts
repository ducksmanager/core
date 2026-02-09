import { config } from "dotenv";
import { fileURLToPath } from "url";
import type { PrismaConfig } from "prisma/config";

// Resolve .env path relative to this config file
const envPath = fileURLToPath(new URL("../../.env", import.meta.url));

config({ path: envPath, override: true });

const databaseUrl = process.env.DATABASE_URL_DM;
if (!databaseUrl) {
  throw new Error(`DATABASE_URL_DM is not set`);
}

const prismaConfig: PrismaConfig = {
  schema: "schema.prisma",
  datasource: {
    url: databaseUrl,
  },
};

export default prismaConfig;
