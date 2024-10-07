import { PrismaClient as PrismaCoa } from "~prisma-schemas/client_coa";
import { PrismaClient as PrismaCoverInfo } from "~prisma-schemas/client_cover_info";
import { PrismaClient as PrismaDm } from "~prisma-schemas/client_dm";
import { PrismaClient as PrismaDmStats } from "~prisma-schemas/client_dm_stats";
import { PrismaClient as PrismaEdgeCreator } from "~prisma-schemas/client_edgecreator";

export const prismaCoa = new PrismaCoa();
export const prismaCoverInfo = new PrismaCoverInfo();
export const prismaDm = new PrismaDm();
export const prismaDmStats = new PrismaDmStats();
export const prismaEdgeCreator = new PrismaEdgeCreator();
