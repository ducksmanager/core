import type { Socket } from "socket.io";

import type { IssueWithIssuecodeOnly } from "~dm-types/SimpleIssue";
import { prismaClient as  prismaCoa } from "~prisma-schemas/schemas/coa/client";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("getIssues", (issuecodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuenumber: true,
          issuecode: true,
        },
        where: {issuecode: {in: issuecodes}},
      })
      .then((data) =>
        data.groupBy('issuecode')
      )
      .then(callback),
  );

  socket.on("getIssuesByPublicationcodes", async (publicationcodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuenumber: true,
          issuecode: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes,
          },
        },
      })
      .then((data) =>
        data.groupBy('publicationcode', '[]')
      )
      .then(callback),
  );

  socket.on("getIssuesByStorycode", async (storycode, callback) =>
    prismaCoa.$queryRaw<IssueWithIssuecodeOnly[]>`
      SELECT publicationcode, issuenumber, issuecode
      FROM inducks_issue issue
                INNER JOIN inducks_entry entry using (issuecode)
                INNER JOIN inducks_storyversion sv using (storyversioncode)
      WHERE sv.storycode = ${storycode}
      GROUP BY publicationcode, issuenumber
      ORDER BY publicationcode`.then(callback),
  );

  socket.on("getRecentIssues", (callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuenumber: true,
          issuecode: true,
        },
        where: {
          oldestdate: {
            lte: new Date().toISOString().split("T")[0],
          },
        },
        orderBy: [{ oldestdate: "desc" }],
        take: 50,
      })
      .then(callback),
  );
};
