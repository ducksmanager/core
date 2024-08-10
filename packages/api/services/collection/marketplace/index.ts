import type { Socket } from "socket.io";

import type { issue } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type Events from "../types";
import contactMethods from "./contact-methods";
import { augmentIssueArrayWithInducksData } from "~/services/coa";

export default (socket: Socket<Events>) => {
  contactMethods(socket);

  socket.on("deleteRequests", async (issueId, callback) => {
    await prismaDm.requestedIssue.deleteMany({
      where: {
        buyerId: socket.data.user!.id,
        issueId,
      },
    });
    callback();
  });

  socket.on("createRequests", async (issueIds, callback) => {
    if (issueIds.find((issueId) => isNaN(issueId))) {
      callback({ error: `Invalid issue ID list, NaN` });
      return;
    }
    const issues = await prismaDm.issue.findMany({
      where: {
        id: { in: issueIds },
        isOnSale: true,
      },
    });
    if (issues.length !== issueIds.length) {
      callback({
        error: `The provided issue IDs were not all found`,
        errorDetails: `The provided issue IDs (${issueIds.length} provided)were not all found (${issues.length} found)`,
      });
      return;
    }
    const alreadyRequestedIssueIds = (
      await prismaDm.requestedIssue.findMany({
        select: {
          issueId: true,
        },
        where: {
          buyerId: socket.data.user!.id,
          issueId: { in: issueIds },
        },
      })
    ).map(({ issueId }) => issueId);
    const newlyRequestedIssueIds = issueIds.filter(
      (issueId: number) => !alreadyRequestedIssueIds.includes(issueId),
    );
    await prismaDm.requestedIssue.createMany({
      data: newlyRequestedIssueIds.map((issueId: number) => ({
        isBooked: false,
        buyerId: socket.data.user!.id,
        issueId,
      })),
    });
    callback();
  });

  socket.on("getRequests", async (as, callback) => {
    switch (as) {
      case "seller":
        const requestedIssuesOnSaleIds = await prismaDm.$queryRaw<
          { id: number }[]
        >`
            SELECT requestedIssue.ID AS id
            FROM numeros_demandes requestedIssue
            INNER JOIN numeros issue ON requestedIssue.ID_Numero = issue.ID
            WHERE issue.ID_Utilisateur = ${socket.data.user!.id}
        `;
        callback(
          await prismaDm.requestedIssue.findMany({
            where: {
              id: { in: requestedIssuesOnSaleIds.map(({ id }) => id) },
            },
          }),
        );
        break;
      case "buyer":
        callback(
          await prismaDm.requestedIssue.findMany({
            where: {
              buyerId: socket.data.user!.id,
            },
          }),
        );
    }
  });

  socket.on("getIssuesForSale", (callback) =>
    getIssuesForSale(socket.data.user!.id).then(callback),
  );
};

export const getIssuesForSale = async (buyerId: number) =>
  prismaDm.$queryRaw<(Pick<issue, 'id'>)[]
  >`
    SELECT issue.ID as id
    FROM numeros issue
    INNER JOIN (
      SELECT seller.ID
      FROM users seller
      INNER JOIN users_options uo on seller.ID = uo.ID_User
      WHERE uo.Option_nom = 'marketplace_contact_methods'
    ) AS seller
        ON issue.ID_Utilisateur = seller.ID
    LEFT JOIN numeros_demandes requested_issue
        ON issue.ID = requested_issue.ID_Numero
    WHERE
      AV = 1
      AND issue.issuecode IS NOT NULL
      AND ID_Utilisateur != ${buyerId}
      AND EXISTS(
        SELECT 1 FROM users_options uo
        WHERE uo.ID_User = ${buyerId}
          AND uo.Option_nom = 'sales_notification_publications'
          AND uo.Option_valeur IN (CONCAT(issue.Pays, '/', issue.Magazine),
                                   issue.issuecode)
      )
      AND NOT EXISTS
        (SELECT 1
         FROM numeros user_collection
         WHERE user_collection.issuecode = issue.issuecode
           AND user_collection.ID_Utilisateur = ${buyerId}
        )`
    .then((idsForSale) => prismaDm.issue.findMany({
      select: {
        userId: true,
        id: true,
        issuecode: true,
      },
      where: {
        id: {
          in: idsForSale.map(({ id }) => id),
        },
      }
    }) as Promise<(issue & { issuecode: string })[]>).then(augmentIssueArrayWithInducksData)
