import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import type { PoolConnection } from "mariadb";
import { createPool } from "mariadb";

dotenv.config();

for (const envKey of [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_PASSWORD",
  "DATABASE_URL_DM_STATS",
]) {
  if (!process.env[envKey]) {
    console.error(`Environment variable not found, aborting: ${envKey}`);
    process.exit(1);
  }
}

let connection: PoolConnection;

const pool = createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT!),
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
});

export const connect = async () => {
  try {
    connection = await pool.getConnection();
  } catch (err: unknown) {
    console.error(err);
  }
};

export const disconnect = async () => {
  if (connection) {
    await connection.end();
  }
  return pool.end();
};

export const runMigrations = async () => {
  const { stdout, stderr } = spawnSync(
    "pnpm",
    ["-F", "~prisma-schemas", "prisma-migrate"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        SCHEMA: "dm_stats",
      },
    },
  );

  console.log(stdout);
  if (stderr) {
    throw new Error(stderr);
  }
};

export const generatePrismaClient = async () => {
  const { stdout, stderr } = spawnSync(
    "pnpm",
    ["-F", "~prisma-schemas", "prisma-generate"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        SCHEMA: "dm_stats",
      },
    },
  );

  console.log(stdout);
  if (stderr) {
    throw new Error(stderr);
  }
};

export const runQuery = async (sql: string) => {
  console.log(new Date().toISOString());
  console.debug(sql);
  return await connection.query(sql);
};

export const runQueryFile = async (sqlFile: string) =>
  runQuery(readFileSync(sqlFile).toString());
