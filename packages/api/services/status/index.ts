import axios from "axios";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaCoverInfo } from "~prisma-schemas/schemas/cover_info/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaDmStats } from "~prisma-schemas/schemas/dm_stats/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

export const getDbStatus = async (): Promise<
  { error: string } | { status: "ok" }
> => {
  const checks = [
    { db: "dm", check: prismaDm.user.count() },
    { db: "coverInfo", check: prismaCoverInfo.cover.count() },
    {
      db: "dmStats",
      check: prismaDmStats.missingStoryForUser.count(),
    },
    {
      db: "edgecreator",
      check: prismaEdgeCreator.edgeModel.count(),
    },
  ];

  const failedChecks = [];
  for (const { db, check } of checks) {
    if ((await check) === 0) {
      failedChecks.push(db);
    }
  }

  if (failedChecks.length) {
    return {
      error: "Some DB checks have failed: " + failedChecks.join(", "),
    };
  }

  const coaTables = (
    await prismaCoa.$queryRaw<
      {
        Tables_in_coa: string;
      }[]
    >`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`
  ).map(({ Tables_in_coa }) => Tables_in_coa);
  const query = coaTables
    .map(
      (coaTable) =>
        `(SELECT '${coaTable}' AS tableName, (SELECT COUNT(*) FROM ${coaTable} AS tableCount))`,
    )
    .join(" UNION ");
  const coaTablesWithCount = (await prismaCoa.$queryRawUnsafe<{tableName: string, tableCount: number}[]>(query));
  const emptyCoaTables = coaTablesWithCount.filter(
    ({ tableCount }) => tableCount === 0,
  );
  if (emptyCoaTables.length) {
    return {
      error: `Some COA tables are empty: ${emptyCoaTables.join(", ")}`,
    };
  }

  return {
    status: "ok",
  };
};

export const getPastecStatus = async (): Promise<
  { numberOfImages: number } | { error: string }
> => {
  try {
    const response = (
      await axios.get(
        `${process.env.PASTEC_HOSTS}:${process.env.PASTEC_PORT}/index/imageIds`,
      )
    ).data;
    if (response) {
      const imageIds = JSON.parse(response)?.image_ids;
      if (imageIds) {
        return { numberOfImages: imageIds.length };
      } else {
        return { error: "Pastec /imageIds response is invalid" };
      }
    } else {
      return { error: "Pastec is unreachable" };
    }
  } catch (e) {
    return { error: `Pastec is unreachable: ${e}` };
  }
};

export const getPastecSearchStatus = async (): Promise<
  { numberOfImages: number } | { error: string }
> => {
  try {
    const response = (
      await axios.post(
        `${process.env.PASTEC_HOSTS}:${process.env.PASTEC_PORT}/searcher`,
        `${process.env.INDUCKS_COVERS_ROOT}/au/bp/001/au_bp_001a_001.jpg`,
      )
    ).data;
    if (response) {
      const imageIds: number[] = JSON.parse(response)?.imageIds;
      if (imageIds) {
        if (imageIds.length) {
          return { numberOfImages: imageIds.length };
        } else {
          return { error: "Pastec search returned no image" };
        }
      }
    }
    return { error: "Pastec /searcher response is invalid" };
  } catch (e) {
    return { error: `Pastec is unreachable: ${e}` };
  }
};
