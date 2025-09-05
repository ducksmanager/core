import { PrismaClient as PrismaClientDm } from "../client_dm/client";
import { PrismaClient as PrismaClientDmStats } from "../client_dm_stats/client";
import { PrismaClient as PrismaClientCoa } from "../client_coa/client";
import { PrismaClient as PrismaClientEdgeCreator } from "../client_edgecreator/client";
import { PrismaClient as PrismaClientCoverInfo } from "../client_cover_info/client";

import prismaExtendedDm from "../schemas/dm/extended";
import prismaExtendedCoa from "../schemas/coa/extended";

let dmClient: ReturnType<typeof prismaExtendedDm> | null = null;
let dmStatsClient: PrismaClientDmStats | null = null;
let coaClient: ReturnType<typeof prismaExtendedCoa> | null = null;
let edgeCreatorClient: PrismaClientEdgeCreator | null = null;
let coverInfoClient: PrismaClientCoverInfo | null = null;

export const getDmClient = () => {
  if (!dmClient) {
    console.log('Creating new DM PrismaClient instance');
    dmClient = prismaExtendedDm(new PrismaClientDm({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }));
  }
  return dmClient;
};

export const getDmStatsClient = () => {
  if (!dmStatsClient) {
    console.log('Creating new DM Stats PrismaClient instance');
    dmStatsClient = new PrismaClientDmStats({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return dmStatsClient;
};

export const getCoaClient = () => {
  if (!coaClient) {
    console.log('Creating new COA PrismaClient instance');
    coaClient = prismaExtendedCoa(new PrismaClientCoa({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }));
  }
  return coaClient;
};

export const getEdgeCreatorClient = () => {
  if (!edgeCreatorClient) {
    console.log('Creating new EdgeCreator PrismaClient instance');
    edgeCreatorClient = new PrismaClientEdgeCreator({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return edgeCreatorClient;
};

export const getCoverInfoClient = () => {
  if (!coverInfoClient) {
    console.log('Creating new CoverInfo PrismaClient instance');
    coverInfoClient = new PrismaClientCoverInfo({
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
