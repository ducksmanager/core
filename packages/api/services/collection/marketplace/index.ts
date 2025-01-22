import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type { issue } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";
import contactMethods from "./contact-methods";

export default (services: UserServices) => {
  const { _socket } = services;
  return ({
    ...contactMethods(services),

    deleteRequests: async (issueId: number) => {
      await prismaDm.requestedIssue.deleteMany({
        where: {
          buyerId: _socket.data.user!.id,
          issueId,
        },
      });
    },

    createRequests: async (issueIds: number[]) => {
      if (issueIds.find((issueId) => isNaN(issueId))) {
        return { error: `Invalid issue ID list, NaN` };
      }
      const issues = await prismaDm.issue.findMany({
        where: {
          id: { in: issueIds },
          isOnSale: true,
        },
      });
      if (issues.length !== issueIds.length) {
        return {
          error: `The provided issue IDs were not all found`,
          errorDetails: `The provided issue IDs (${issueIds.length} provided)were not all found (${issues.length} found)`,
        };
      }
      const alreadyRequestedIssueIds = (
        await prismaDm.requestedIssue.findMany({
          select: {
            issueId: true,
          },
          where: {
            buyerId: _socket.data.user!.id,
            issueId: { in: issueIds },
          },
        })
      ).map(({ issueId }) => issueId);
      const newlyRequestedIssueIds = issueIds.filter(
        (issueId: number) => !alreadyRequestedIssueIds.includes(issueId)
      );
      await prismaDm.requestedIssue.createMany({
        data: newlyRequestedIssueIds.map((issueId: number) => ({
          isBooked: false,
          buyerId: _socket.data.user!.id,
          issueId,
        })),
      });
    },

    getRequests: async (as: "buyer" | "seller") => {
      switch (as) {
        case "seller":
          const requestedIssuesOnSaleIds = await prismaDm.$queryRaw<
            { id: number; }[]
          > `
            SELECT requestedIssue.ID AS id
            FROM numeros_demandes requestedIssue
            INNER JOIN numeros issue ON requestedIssue.ID_Numero = issue.ID
            WHERE issue.ID_Utilisateur = ${_socket.data.user!.id}
        `;
          return await prismaDm.requestedIssue.findMany({
            where: {
              id: { in: requestedIssuesOnSaleIds.map(({ id }) => id) },
            },
          });
        case "buyer":
          return await prismaDm.requestedIssue.findMany({
            where: {
              buyerId: _socket.data.user!.id,
            },
          });
      }
    },

    getIssuesForSale: () => getIssuesForSale(_socket.data.user!.id),
  });
};

export const getIssuesForSale = async (buyerId: number) =>
  prismaDm.$queryRaw<Pick<issue, "id">[]>`
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
    .then(
      (idsForSale) =>
        prismaDm.issue.findMany({
          select: {
            userId: true,
            id: true,
            issuecode: true,
          },
          where: {
            id: {
              in: idsForSale.map(({ id }) => id),
            },
          },
        }) as Promise<(issue & { issuecode: string })[]>,
    )
    .then(prismaCoa.augmentIssueArrayWithInducksData);
