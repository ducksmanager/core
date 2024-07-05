import type { Socket } from "socket.io";

import type { SimpleIssue } from "~dm-types/SimpleIssue";
import { prismaCoa } from "~prisma-clients";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("decompose", (shortIssuecodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        where: {
          shortIssuecode: {
            in: shortIssuecodes,
          },
        },
      })
      .then((data) =>
        data.reduce(
          (acc, value) => ({
            ...acc,
            [value.shortIssuecode]: value,
          }),
          {},
        ),
      )
      .then(callback),
  );

  socket.on("getIssuesByPublicationCodes", async (publicationCodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuenumber: true,
          shortIssuecode: true
        },
        where: {
          publicationcode: {
            in: publicationCodes,
          },
        },
      })
      .then((issues) => {
        callback({
          issues: issues.map(({ publicationcode, shortIssuecode, issuenumber }) => ({
            shortIssuecode,
            publicationcode: publicationcode!,
            issuenumber: issuenumber!,
          })),
        });
      }),
  );

  socket.on("getIssuesByStorycode", async (storycode, callback) =>
    prismaCoa.$queryRaw<SimpleIssue[]>`
      SELECT publicationcode, issuenumber, short_issuecode AS shortIssuecode
      FROM inducks_issue issue
                INNER JOIN inducks_entry entry using (short_issuecode)
                INNER JOIN inducks_storyversion sv using (storyversioncode)
      WHERE sv.storycode = ${storycode}
      GROUP BY publicationcode, issuenumber
      ORDER BY publicationcode`.then(callback),
  );

  socket.on("getRecentIssues", (callback) =>
    prismaCoa.inducks_issue
      .findMany({
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
