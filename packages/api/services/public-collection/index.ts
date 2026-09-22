import { useSocketEvents } from "socket-call-server";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

import type { issue, user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import namespaces from "../namespaces";

const listenEvents = () => ({
  getPublicCollection: ev(v.string())(async (username) => {
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
      issues: await prismaDm.issue
        .findMany({
          where: {
            userId: user.id,
            issuecode: {
              not: null,
            },
          },
        })
        .then((issues) =>
          prismaCoa.augmentIssueArrayWithInducksData(
            issues as (issue & { issuecode: string })[],
          ),
        )
        .then((issues) =>
          issues.map((issue) => ({
            ...issue,
            labelIds: [] as number[],
          })),
        ),
    };
  }),
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.PUBLIC_COLLECTION,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
