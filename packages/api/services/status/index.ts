import axios from "axios";
import { readFileSync } from "fs";
import { Server } from "socket.io";

import {
  prismaCoa,
  prismaCoverInfo,
  prismaDm,
  prismaDmStats,
  prismaEdgeCreator,
} from "~/prisma";

import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
    socket.on("getDbStatus", async (callback) => {
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

      const failedChecks = checks.filter(async ({ check }) => await check() === 0);
      if (failedChecks.length) {
        callback({ error: 'Some DB checks have failed', errorDetails: failedChecks.map(({ db }) => db).join(', ') })
        return
      }

      const coaTables = (
        (await prismaCoa.$queryRaw`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`) as {
          Tables_in_coa: string;
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
        callback({ error: 'Some COA tables are empty', errorDetails: emptyCoaTables.join(', ') })
      }
      else {
        callback()
      }
    });

    socket.on("getPastecStatus", async (callback) => {
      const response = (await axios.get(`${process.env.PASTEC_HOSTS}/imageIds`))
        .data;
      if (response) {
        const imageIds = JSON.parse(response)?.image_ids;
        if (imageIds) {
          callback({ numberOfImages: imageIds.length });
        } else {
          callback({ error: "Pastec /imageIds response is invalid" });
        }
      } else {
        callback({ error: "Pastec is unreachable" });
      }
    });

    socket.on('getPastecSearchStatus', async (callback) => {
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
            callback({ numberOfImages: imageIds.length });
          } else {
            callback({ error: "Pastec search returned no image" });
          }
        } else {
          callback({ error: "Pastec /searcher response is invalid" });
        }
      } else {
        callback({ error: "Pastec is unreachable" });
      }
    })
  });
};
