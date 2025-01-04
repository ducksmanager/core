import type { Socket } from "socket.io";

import { COVER } from "~dumili-types/storyKinds";
import type { Prisma } from "~prisma/client_dumili";
import { useSocketServices } from "~socket.io-services";

import type { SessionData } from "../../index";
import { prisma } from "../../index";
import { RequiredAuthMiddleware } from "../_auth";
import { createEntry } from "../indexation";
import namespaces from "../namespaces";

export type IndexationsSocket = Socket<object, object, object, SessionData>;

const listenEvents = (socket: IndexationsSocket) => ({
  getUser: async () => ({
    username: socket.data.user.username,
  }),

  create: async (id: string, numberOfPages: number) =>
    prisma.indexation
      .create({
        data: {
          id,
          dmUserId: socket.data.user.id,
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
      .then((entry) =>
        prisma.entry.update({
          data: {
            acceptedStoryKindSuggestionId: entry.storyKindSuggestions.find(
              (s) => s.kind === COVER,
            )!.id,
          },
          where: {
            id: entry.id,
          },
        }),
      ),

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
        dmUserId: socket.data.user.id,
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

const { client, server } = useSocketServices<
  typeof listenEvents,
  Record<string, never>,
  Record<string, never>,
  SessionData
>(namespaces.INDEXATIONS, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
