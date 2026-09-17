import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { COVER } from "~dumili-types/storyKinds";
import prisma from "~prisma/client";

import type { SessionData } from "../../index";
import { OptionalAuthMiddleware } from "../_auth";
import { createEntry } from "../indexation";
import namespaces from "../namespaces";

type IndexationCreationServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SessionData>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: IndexationCreationServices) => ({
  create: async (numberOfPages: number) =>
    prisma.indexation
      .create({
        data: {
          dmUserId: _socket.data.user?.id || null,
          pages: {
            createMany: {
              data: Array.from({ length: numberOfPages }).map((_, idx) => ({
                pageNumber: idx + 1,
              })),
            },
          },
        },
      })
      .then((indexation) => createEntry(indexation.id, 1))
      .then((entry) =>
        prisma.entry.update({
          data: {
            acceptedStoryKindSuggestionId: entry.storyKindSuggestions.find(
              (s) => s.storyKindRowsStr.split("/")[0] === COVER,
            )!.id,
          },
          where: {
            id: entry.id,
          },
        }),
      )
      .then((entry) => entry.indexationId),
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.INDEXATION_CREATION, {
  listenEvents,
  middlewares: [OptionalAuthMiddleware],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
