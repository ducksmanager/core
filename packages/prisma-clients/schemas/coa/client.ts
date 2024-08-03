import prismaExtended from "./extended";

import { PrismaClient } from "../../client_coa";

export const prismaClient = prismaExtended(new PrismaClient());
