import { PrismaClient as PrismaCoa } from "~prisma-clients/client_coa";
import { PrismaClient as PrismaCoverInfo } from "~prisma-clients/client_cover_info";
import { PrismaClient as PrismaDm } from "~prisma-clients/client_dm/";
import { PrismaClient as PrismaDmStats } from "~prisma-clients/client_dm_stats";
import { PrismaClient as PrismaEdgeCreator } from "~prisma-clients/client_edgecreator";

export const prismaCoa = new PrismaCoa();
export const prismaCoverInfo = new PrismaCoverInfo();
export const prismaDm = new PrismaDm();
export const prismaDmStats = new PrismaDmStats();
export const prismaEdgeCreator = new PrismaEdgeCreator();
