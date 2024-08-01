export * from "./extended";

import prismaExtended from "./extended";

import { PrismaClient } from "../../client_dm";

export const prismaClient = prismaExtended(new PrismaClient());
