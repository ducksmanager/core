import { PrismaClient } from "../../client_dm/client";
import prismaExtended from "./extended";

export const prismaClient = prismaExtended(new PrismaClient());
