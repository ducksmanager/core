import { useSocketEvents } from "socket-call-server";

import type { issue, user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import namespaces from "../namespaces";

const listenEvents = () => ({
  getPublicCollection: async (username: string) => {
    let user: user;
    try {
      user = await prismaDm.user.findFirstOrThrow({
        where: { username },
      });
    } catch (_e) {
      return { error: "User not found" };
    }
    if (!user.allowSharing) {
      return { error: "This user does not allow sharing" };
    }
    return {
      issues: (await prismaDm.issue.findMany({
        where: {
          userId: user.id,
          issuecode: {
            not: null,
          },
        },
      })) as (issue & { issuecode: string })[],
    };
  },
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.PUBLIC_COLLECTION,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
