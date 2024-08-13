import { PrismaClient } from "../../client_dm";
import prismaExtended from "./extended";

export const prismaClient = prismaExtended(new PrismaClient());
