import { Socket } from "socket.io";

import { issue } from "~prisma-clients/client_dm";
import prismaDm, { issueWithPublicationcode } from "~prisma-clients/extended/dm.extends";

import Events from "../types";
import contactMethods from "./contact-methods";

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
      (issueId: number) => !alreadyRequestedIssueIds.includes(issueId)
    );
    await prismaDm.requestedIssue.createMany({
      data: newlyRequestedIssueIds.map((issueId: number) => ({
        buyerId: socket.data.user!.id,
        issueId,
      })),
    });
    callback();
  });

  socket.on("getRequests", async (as, callback) => {
    switch (as) {
      case "seller":
        const requestedIssuesOnSaleIds = (await prismaDm.$queryRaw<{ id: number }[]>`
            SELECT requestedIssue.ID AS id
            FROM numeros_demandes requestedIssue
            INNER JOIN numeros issue ON requestedIssue.ID_Numero = issue.ID
            WHERE issue.ID_Utilisateur = ${socket.data.user!.id}
        `);
        callback(
          await prismaDm.requestedIssue.findMany({
            where: {
              id: { in: requestedIssuesOnSaleIds.map(({ id }) => id) },
            },
          })
        );
      case "buyer":
        callback(
          await prismaDm.requestedIssue.findMany({
            where: {
              buyerId: socket.data.user!.id,
            },
          })
        );
    }
  });

  socket.on("getIssuesForSale", (callback) =>
    getIssuesForSale(socket.data.user!.id).then(callback)
  );
};

export const getIssuesForSale = async (buyerId: number) =>
  prismaDm.$queryRaw<
    {
      id: issue["id"];
    }[]
  >`
    SELECT issue.ID AS id
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
      AND ID_Utilisateur != ${buyerId}
      AND EXISTS(
        SELECT 1 FROM users_options uo
        WHERE uo.ID_User = ${buyerId}
          AND uo.Option_nom = 'sales_notification_publications'
          AND uo.Option_valeur IN (CONCAT(issue.Pays, '/', issue.Magazine),
                                   CONCAT(issue.Pays, '/', issue.Magazine, ' ', issue.Numero))
      )
      AND NOT EXISTS
        (SELECT 1
         FROM numeros user_collection
         WHERE user_collection.Pays = issue.Pays
           AND user_collection.Magazine = issue.Magazine
           AND user_collection.Numero = issue.Numero
           AND user_collection.ID_Utilisateur = ${buyerId}
        )`
    .then(async (forSale) =>
      prismaDm.issue.findMany({
        where: { id: { in: forSale.map(({ id }) => id) } },
      })
    )
    .then((issuesForSale) =>
      issuesForSale.reduce<Record<string, issueWithPublicationcode[]>>(
        (acc, issue) => ({
          ...acc,
          [issue.publicationcode]: [
            ...(acc[issue.publicationcode] || []),
            issue,
          ],
        }),
        {}
      )
    );
