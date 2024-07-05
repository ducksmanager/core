export * as client_coa from "./client_coa";
export * as client_cover_info from "./client_cover_info";
export * as client_dm from "./extended/dm.extends";
export * as client_dm_stats from "./client_dm_stats";
export * as client_edgecreator from "./client_edgecreator";

import prismaDmExtend from "./extended/dm.extends";

import { PrismaClient as PrismaCoa } from "./client_coa";
import { PrismaClient as PrismaCoverInfo } from "./client_cover_info";
import { PrismaClient as PrismaDm } from "./client_dm";
import { PrismaClient as PrismaDmStats } from "./client_dm_stats";
import { PrismaClient as PrismaEdgeCreator } from "./client_edgecreator";

export const prismaCoa = new PrismaCoa();
export const prismaCoverInfo = new PrismaCoverInfo();
export const prismaDm = prismaDmExtend(new PrismaDm());
export const prismaDmStats = new PrismaDmStats();
export const prismaEdgeCreator = new PrismaEdgeCreator();
