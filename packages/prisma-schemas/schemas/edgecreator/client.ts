import { PrismaClient } from "../../client_edgecreator/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_EDGECREATOR!);

export const prismaClient = new PrismaClient({ adapter });
