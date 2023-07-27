import { PrismaClient as PrismaprismaCoa } from "~prisma_clients/client_coa";
import { PrismaClient as PrismaprismaCoverInfo } from "~prisma_clients/client_cover_info";
import { PrismaClient as PrismaprismaDm } from "~prisma_clients/client_dm";
import { PrismaClient as PrismaprismaDmStats } from "~prisma_clients/client_dm_stats";
import { PrismaClient as PrismaprismaEdgeCreator } from "~prisma_clients/client_edgecreator";

export const prismaCoa = new PrismaprismaCoa();
export const prismaCoverInfo = new PrismaprismaCoverInfo();
export const prismaDm = new PrismaprismaDm();
export const prismaDmStats = new PrismaprismaDmStats();
export const prismaEdgeCreator = new PrismaprismaEdgeCreator();
