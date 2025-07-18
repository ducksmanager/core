import { PrismaClient } from "../../client_dm_stats/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_DM_STATS!);

export const prismaClient = new PrismaClient({ adapter });
