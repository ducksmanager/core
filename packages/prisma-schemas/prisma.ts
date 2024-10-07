import { PrismaClient as PrismaCoa } from "./client_coa";
import { PrismaClient as PrismaCoverInfo } from "./client_cover_info";
import { PrismaClient as PrismaDm } from "./client_dm";
import { PrismaClient as PrismaDmStats } from "./client_dm_stats";
import { PrismaClient as PrismaEdgeCreator } from "./client_edgecreator";

export const prismaCoa = new PrismaCoa();
export const prismaCoverInfo = new PrismaCoverInfo();
export const prismaDm = new PrismaDm();
export const prismaDmStats = new PrismaDmStats();
export const prismaEdgeCreator = new PrismaEdgeCreator();
