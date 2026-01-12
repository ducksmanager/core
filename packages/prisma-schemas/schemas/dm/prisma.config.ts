import "dotenv/config";
import { type PrismaConfig, env, defineConfig } from "prisma/config";

export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig);
