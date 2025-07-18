import { PrismaClient } from "../../client_coa/client";
import prismaExtended from "./extended";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_COA!);

export const prismaClient = prismaExtended(new PrismaClient({ adapter }));
