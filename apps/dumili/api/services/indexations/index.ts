import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { COVER } from "~dumili-types/storyKinds";
import type { Prisma } from "~prisma/client_dumili";

import type { SessionData } from "../../index";
import { prisma } from "../../index";
import { RequiredAuthMiddleware } from "../_auth";
import { createEntry } from "../indexation";
import namespaces from "../namespaces";

export type IndexationsServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SessionData>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: IndexationsServices) => ({
  getUser: async () => ({
    username: _socket.data.user.username,
  }),

  create: async (id: string, numberOfPages: number) =>
    prisma.indexation
      .create({
        data: {
          id,
          dmUserId: _socket.data.user.id,
          pages: {
            createMany: {
              data: Array.from({ length: numberOfPages }).map((_, idx) => ({
                pageNumber: idx + 1,
              })),
            },
          },
        },
      })
      .then((indexation) => createEntry(indexation.id))
      .then((entry) => {
        return prisma.entry.update({
          data: {
            acceptedStoryKindSuggestionId: entry.storyKindSuggestions.find(
              (s) => s.kind === COVER,
            )!.id,
          },
          where: {
            id: entry.id,
          },
        });
      }),

  getIndexations: (): Promise<
    Prisma.indexationGetPayload<{
      include: {
        acceptedIssueSuggestion: true;
        pages: {
          include: {
            image: true;
          };
        };
      };
    }>[]
  > =>
    prisma.indexation.findMany({
      where: {
        dmUserId: _socket.data.user.id,
      },
      include: {
        acceptedIssueSuggestion: true,
        pages: {
          include: {
            image: true,
          },
          take: 1,
          orderBy: {
            pageNumber: "asc",
          },
        },
      },
    }),
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.INDEXATIONS, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
