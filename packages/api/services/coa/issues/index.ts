import type { Socket } from "socket.io";

import { prismaCoa } from "~/prisma";
import type { SimpleIssue } from "~dm-types/SimpleIssue";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("decompose", (issueCodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        where: {
          issuecode: {
            in: issueCodes,
          },
        },
      })
      .then((data) =>
        data.reduce(
          (acc, value) => ({
            ...acc,
            [value.issuecode]: value,
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
        },
        where: {
          publicationcode: {
            in: publicationCodes,
          },
        },
      })
      .then((issues) => {
        callback({
          issues: issues.map(({ publicationcode, issuenumber }) => ({
            code: "",
            publicationcode: publicationcode!,
            issuenumber: issuenumber!.replace(/ +/g, " "),
          })),
        });
      }),
  );

  socket.on("getIssuesByStorycode", async (storycode, callback) =>
    prismaCoa.$queryRaw<SimpleIssue[]>`
      SELECT issuecode as code,
              publicationcode,
              issuenumber
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
