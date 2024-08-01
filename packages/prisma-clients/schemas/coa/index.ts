export * from "./extended";
import "../../../util/groupBy";

import prismaExtended from "./extended";

import { PrismaClient } from "../../client_coa";
export { PrismaClient };

export const prismaClient = prismaExtended(new PrismaClient());
