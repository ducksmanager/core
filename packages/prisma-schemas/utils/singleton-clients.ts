import { PrismaClient as PrismaClientDm } from "../client_dm/client";
import { PrismaClient as PrismaClientDmStats } from "../client_dm_stats/client";
import { PrismaClient as PrismaClientCoa } from "../client_coa/client";
import { PrismaClient as PrismaClientEdgeCreator } from "../client_edgecreator/client";
import { PrismaClient as PrismaClientCoverInfo } from "../client_cover_info/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import prismaExtendedDm from "../schemas/dm/extended";
import prismaExtendedCoa from "../schemas/coa/extended";

// Ensure connection string has proper pool parameters
const ensureConnectionString = (url: string): string => {
  if (!url || typeof url !== 'string') {
    throw new Error(`Invalid database URL: ${url}`);
  }
  
  try {
    const urlObj = new URL(url);
    
    // Add pool parameters if not present
    if (!urlObj.searchParams.has('acquireTimeout')) {
      urlObj.searchParams.set('acquireTimeout', '60000');
    }
    if (!urlObj.searchParams.has('connectionLimit')) {
      urlObj.searchParams.set('connectionLimit', '10');
    }
    if (!urlObj.searchParams.has('idleTimeout')) {
      urlObj.searchParams.set('idleTimeout', '300000');
    }
    if (!urlObj.searchParams.has('minimumIdle')) {
      urlObj.searchParams.set('minimumIdle', '2');
    }
    
    return urlObj.toString();
  } catch (error) {
    throw new Error(`Invalid database URL format: ${url}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

let dmClient: ReturnType<typeof prismaExtendedDm> | null = null;
let dmStatsClient: PrismaClientDmStats | null = null;
let coaClient: ReturnType<typeof prismaExtendedCoa> | null = null;
let edgeCreatorClient: PrismaClientEdgeCreator | null = null;
let coverInfoClient: PrismaClientCoverInfo | null = null;

export const getDmClient = () => {
  if (!dmClient) {
    try {
      console.log('Creating new DM PrismaClient instance');
      const connectionString = ensureConnectionString(process.env.DATABASE_URL_DM!);
      console.log('DM connection string configured with pool parameters');
      dmClient = prismaExtendedDm(new PrismaClientDm({
        adapter: new PrismaMariaDb(connectionString),
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      }));
    } catch (error) {
      console.error('Failed to create DM PrismaClient:', error);
      throw error;
    }
  }
  return dmClient;
};

export const getDmStatsClient = () => {
  if (!dmStatsClient) {
    console.log('Creating new DM Stats PrismaClient instance');
    const connectionString = ensureConnectionString(process.env.DATABASE_URL_DM_STATS!);
    dmStatsClient = new PrismaClientDmStats({
      adapter: new PrismaMariaDb(connectionString),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return dmStatsClient;
};

export const getCoaClient = () => {
  if (!coaClient) {
    try {
      console.log('Creating new COA PrismaClient instance');
      const connectionString = ensureConnectionString(process.env.DATABASE_URL_COA!);
      console.log('COA connection string configured with pool parameters');
      coaClient = prismaExtendedCoa(new PrismaClientCoa({
        adapter: new PrismaMariaDb(connectionString),
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      }));
    } catch (error) {
      console.error('Failed to create COA PrismaClient:', error);
      console.error('DATABASE_URL_COA value:', process.env.DATABASE_URL_COA);
      throw error;
    }
  }
  return coaClient;
};

export const getEdgeCreatorClient = () => {
  if (!edgeCreatorClient) {
    console.log('Creating new EdgeCreator PrismaClient instance');
    const connectionString = ensureConnectionString(process.env.DATABASE_URL_EDGECREATOR!);
    edgeCreatorClient = new PrismaClientEdgeCreator({
      adapter: new PrismaMariaDb(connectionString),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return edgeCreatorClient;
};

export const getCoverInfoClient = () => {
  if (!coverInfoClient) {
    console.log('Creating new CoverInfo PrismaClient instance');
    const connectionString = ensureConnectionString(process.env.DATABASE_URL_COVER_INFO!);
    coverInfoClient = new PrismaClientCoverInfo({
      adapter: new PrismaMariaDb(connectionString),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return coverInfoClient;
};

export const disconnectAllClients = async () => {
  const promises = [];
  
  if (dmClient) {
    promises.push(dmClient.$disconnect());
    dmClient = null;
  }
  
  if (dmStatsClient) {
    promises.push(dmStatsClient.$disconnect());
    dmStatsClient = null;
  }
  
  if (coaClient) {
    promises.push(coaClient.$disconnect());
    coaClient = null;
  }
  
  if (edgeCreatorClient) {
    promises.push(edgeCreatorClient.$disconnect());
    edgeCreatorClient = null;
  }
  
  if (coverInfoClient) {
    promises.push(coverInfoClient.$disconnect());
    coverInfoClient = null;
  }
  
  await Promise.all(promises);
  console.log('All PrismaClient instances disconnected');
};

export const getConnectionStatus = () => {
  return {
    dm: dmClient ? 'connected' : 'not created',
    dmStats: dmStatsClient ? 'connected' : 'not created',
    coa: coaClient ? 'connected' : 'not created',
    edgeCreator: edgeCreatorClient ? 'connected' : 'not created',
    coverInfo: coverInfoClient ? 'connected' : 'not created',
  };
};

process.on('beforeExit', async () => {
  await disconnectAllClients();
});

process.on('SIGINT', async () => {
  await disconnectAllClients();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectAllClients();
  process.exit(0);
});
