import * as dotenv from "dotenv";

dotenv.config();

const requiredKeys = [
  "MYSQL_ROOT_PASSWORD",
  "MYSQL_COA_HOST",
  "MYSQL_COA_DATABASE",
  "MYSQL_COVER_INFO_HOST",
  "MYSQL_COVER_INFO_DATABASE",
  "PASTEC_HOSTS_AND_PORTS",
] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`Environment variable not found, aborting: ${key}`);
    process.exit(1);
  }
}

const {
  MYSQL_ROOT_PASSWORD,
  MYSQL_COA_HOST,
  MYSQL_COA_DATABASE,
  MYSQL_COVER_INFO_HOST,
  MYSQL_COVER_INFO_DATABASE,
  PASTEC_HOSTS_AND_PORTS,
} = process.env as Record<(typeof requiredKeys)[number], string>;

const databaseUrl = (host: string, database: string) =>
  `mysql://root:${encodeURIComponent(MYSQL_ROOT_PASSWORD)}@${
    host.includes(":") ? host : `${host}:3306`
  }/${database}`;

// The Prisma clients read DATABASE_URL_*, the container only provides MYSQL_*.
process.env.DATABASE_URL_COA = databaseUrl(MYSQL_COA_HOST, MYSQL_COA_DATABASE);
process.env.DATABASE_URL_COVER_INFO = databaseUrl(
  MYSQL_COVER_INFO_HOST,
  MYSQL_COVER_INFO_DATABASE,
);

export const pastecHosts = PASTEC_HOSTS_AND_PORTS.split(",")
  .map((hostAndPort) => hostAndPort.trim())
  .filter(Boolean);

// Raisable for a single run when the index was legitimately rebuilt and the
// cleanup would otherwise refuse to catch up. See deleteNonIndexedCovers.
export const maxDeletePercent = Number(process.env.MAX_DELETE_PERCENT ?? 10);
