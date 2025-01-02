import { prisma, SessionData } from "../../index";
import { COVER } from "~dumili-types/storyKinds";

import { RequiredAuthMiddleware } from "../_auth";
import { createEntry } from "../indexation";
import { useSocketServices } from "~socket.io-services";
import { Socket } from "socket.io";
import { Prisma } from "~prisma/client_dumili";

export type IndexationsSocket = Socket<object, object, object, SessionData>;

const listenEvents = (socket: IndexationsSocket) => ({
  getUser: () => ({
    username: socket.data.user.username,
  }),

  create: (id: string, numberOfPages: number) =>
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
              (s) => s.kind === COVER
            )!.id,
          },
          where: {
            id: entry.id,
          },
        })
      ),

  getIndexations: (): Promise<
    Prisma.indexationGetPayload<{
      include: {
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
        pages: {
          include: {
            image: true,
          },
          take: 1,
          orderBy: {
            pageNumber: "asc",
          },
        },
        acceptedIssueSuggestion: true,
      },
    }),
});

const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  SessionData
>("/indexations", {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export { server, endpoint };
export type ClientEmitEvents = (typeof client)["emitEvents"];
