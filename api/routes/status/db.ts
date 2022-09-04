import { Handler } from "express";

import { PrismaClient as PrismaClientCoa } from "~prisma_clients/client_coa";
import { PrismaClient as PrismaClientCoverInfo } from "~prisma_clients/client_cover_info";
import { PrismaClient as PrismaClientDm } from "~prisma_clients/client_dm";
import { PrismaClient as PrismaClientDmStats } from "~prisma_clients/client_dm_stats";
import { PrismaClient as PrismaClientEdgecreator } from "~prisma_clients/client_edgecreator";

const prismaCoa = new PrismaClientCoa();
const prismaCoverInfo = new PrismaClientCoverInfo();
const prismaDm = new PrismaClientDm();
const prismaDmStats = new PrismaClientDmStats();
const prismaEdgecreator = new PrismaClientEdgecreator();

export const get: Handler = async (req, res) => {
  res.setHeader("Content-Type", "application/text");
  const checks = [
    { db: "dm", check: async () => prismaDm.user.count() },
    { db: "coverInfo", check: async () => prismaCoverInfo.cover.count() },
    {
      db: "dmStats",
      check: async () => prismaDmStats.missingStoryForUser.count(),
    },
    {
      db: "edgecreator",
      check: async () => prismaEdgecreator.edgeModel.count(),
    },
  ];

  for (const { db, check } of checks) {
    const result = await check();
    if (result === 0) {
      res.writeHead(500);
      res.end("The DB check has failed for DB " + db);
      return;
    }
  }

  const coaTables = (
    (await prismaCoa.$queryRaw`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`) as {
      Tables_in_coa: string;
      Table_type: string;
    }[]
  ).map(({ Tables_in_coa }) => Tables_in_coa);
  const query = coaTables
    .map(
      (coaTable) =>
        `(SELECT ${coaTable} AS tableName, SELECT COUNT(*) FROM ${coaTable} AS tableCount)`
    )
    .join(" UNION ");
  const coaTablesWithCount = (await prismaCoa.$queryRawUnsafe(query)) as {
    tableName: string;
    tableCount: number;
  }[];
  const emptyCoaTables = coaTablesWithCount.filter(
    ({ tableCount }) => tableCount === 0
  );
  if (emptyCoaTables.length) {
    res.writeHead(500);
    res.end("Some COA tables are empty: " + emptyCoaTables.join(","));
  }

  res.writeHead(200);
  res.end("All databases OK");
};
