import { PrismaClient } from "../../client_dm/client";
import prismaExtended from "./extended";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_DM!);

export const prismaClient = prismaExtended(new PrismaClient({ adapter }));
