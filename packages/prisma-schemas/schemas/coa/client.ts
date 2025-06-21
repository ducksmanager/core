import { PrismaClient } from "../../client_coa";
import prismaExtended from "./extended";

export const prismaClient = prismaExtended(new PrismaClient());
