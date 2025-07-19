import { PrismaClient } from "../../client_coa/client";
import prismaExtended from "./extended";

export const prismaClient = prismaExtended(new PrismaClient());
