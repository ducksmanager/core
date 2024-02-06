import axios from "axios";
import { readFileSync } from "fs";

import {
  prismaCoa,
  prismaCoverInfo,
  prismaDm,
  prismaDmStats,
  prismaEdgeCreator,
} from "~/prisma";


export const getDbStatus = async (): Promise<{ error: string } | {status: 'ok'}> => {
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

  const failedChecks = checks.filter(
    async ({ check }) => (await check()) === 0
  );
  if (failedChecks.length) {
    return ({
      error: "Some DB checks have failed: " + failedChecks.map(({ db }) => db).join(", "),
    });
  }

  const coaTables = (
    (await prismaCoa.$queryRaw<{
      Tables_in_coa: string;
    }[]>`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`)
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
    return ({
      error: "Some COA tables are empty: " + emptyCoaTables.join(", "),
    });
  }

  return {
    status: 'ok'
  }
}

export const getPastecStatus = async (): Promise<{ numberOfImages: number } | { error: string }> => {
  const response = (
    await axios.get(`${process.env.PASTEC_HOSTS}/imageIds`)
  ).data;
  if (response) {
    const imageIds = JSON.parse(response)?.image_ids;
    if (imageIds) {
      return ({ numberOfImages: imageIds.length });
    } else {
      return ({ error: "Pastec /imageIds response is invalid" });
    }
  } else {
    return ({ error: "Pastec is unreachable" });
  }
}

export const getPastecSearchStatus = async (): Promise<{ numberOfImages: number } | { error: string }> => {
  const response = (
    await axios.post(
      `${process.env.PASTEC_HOSTS}/searcher`,
      readFileSync(
        `${process.env.INDUCKS_COVERS_ROOT}/au/bp/001/au_bp_001a_001.jpg`
      )
    )
  ).data;
  if (response) {
    const imageIds: number[] = JSON.parse(response)?.imageIds;
    if (imageIds) {
      if (imageIds.length) {
        return ({ numberOfImages: imageIds.length });
      } else {
        return ({ error: "Pastec search returned no image" });
      }
    } else {
      return ({ error: "Pastec /searcher response is invalid" });
    }
  } else {
    return ({ error: "Pastec is unreachable" });
  }
}