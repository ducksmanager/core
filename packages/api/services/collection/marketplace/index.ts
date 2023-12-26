import { prismaDm } from "~/prisma";

import { Socket } from "../types";

export default (socket: Socket) => {
  socket.on('deleteRequests', async (issueId, callback) => {
    await prismaDm.requestedIssue.deleteMany({
      where: {
        buyerId: socket.data.user!.id,
        issueId,
      },
    });
    callback()
  });

  socket.on('createRequests', async (issueIds, callback) => {
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
        error:
          `The provided issue IDs were not all found`
        , errorDetails: `The provided issue IDs (${issueIds.length} provided)were not all found (${issues.length} found)`
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
    callback()
  })

  socket.on('getRequests', async (as, callback) => {
    switch (as) {
      case "seller":
        const requestedIssuesOnSaleIds = (await prismaDm.$queryRaw`
            SELECT requestedIssue.ID AS id
            FROM numeros_demandes requestedIssue
            INNER JOIN numeros issue ON requestedIssue.ID_Numero = issue.ID
            WHERE issue.ID_Utilisateur = ${socket.data.user!.id}
        `) as { id: number }[];
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
}
