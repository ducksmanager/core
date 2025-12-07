import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

dotenv.config({
  path: "./.env",
});

import { PrismaClient as PrismaClientDmStats } from "../client_dm_stats/client";
import { PrismaClient as PrismaClientCoa } from "../client_coa/client";
import { PrismaClient as PrismaClientEdgeCreator } from "../client_edgecreator/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import prismaExtendedDm from "../schemas/dm/extended";
import prismaExtendedCoa from "../schemas/coa/extended";


let dmStatsClient: PrismaClientDmStats | null = null;
let coaClient: ReturnType<typeof prismaExtendedCoa> | null = null;
let edgeCreatorClient: PrismaClientEdgeCreator | null = null;

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
      const bareClient = new PrismaClientCoa({
        adapter: new PrismaMariaDb(connectionString),
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn", "query"]
            : ["error"],
      });
      bareClient.$on("query", async (e) => {
        console.log(`${e.query} ${e.params}`);
      });
      coaClient = prismaExtendedCoa(bareClient); 
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


export const disconnectAllClients = async () => {
  const promises = [];
    
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
  
  await Promise.all(promises);
  console.log('All PrismaClient instances disconnected');
};

export const getConnectionStatus = () => {
  return {
    dmStats: dmStatsClient ? 'connected' : 'not created',
    coa: coaClient ? 'connected' : 'not created',
    edgeCreator: edgeCreatorClient ? 'connected' : 'not created',
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
