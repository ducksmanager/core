import { PrismaClient } from "../../client_cover_info/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_COVER_INFO!);

export const prismaClient = new PrismaClient({ adapter });
