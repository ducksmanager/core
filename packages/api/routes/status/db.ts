import {
  prismaCoa,
  prismaCoverInfo,
  prismaDm,
  prismaDmStats,
  prismaEdgeCreator,
} from "prisma-clients";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: { status: string } }>
) => {
  const checks = [
    { db: "dm", check: async () => prismaDm.user.count() },
    { db: "coverInfo", check: async () => prismaCoverInfo.cover.count() },
    {
      db: "dmStats",
      check: async () => prismaDmStats.missingStoryForUser.count(),
    },
    {
      db: "edgecreator",
      check: async () => prismaEdgeCreator.edgeModel.count(),
    },
  ];

  for (const { db, check } of checks) {
    const result = await check();
    if (result === 0) {
      res.writeHead(500);
      return res.json({
        status: `The DB check has failed for DB ${db}`,
      });
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
    return res.json({
      status: "Some COA tables are empty: " + emptyCoaTables.join(","),
    });
  }
  return res.json({ status: "ok" });
};
