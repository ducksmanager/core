import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { COVER } from "~dumili-types/storyKinds";
import prisma from "~prisma/client";
import type { Prisma } from "~prisma/client_dumili/client";

import type { SessionData } from "../../index";
import { RequiredAuthMiddleware } from "../_auth";
import { createEntry } from "../indexation";
import namespaces from "../namespaces";

export type IndexationsServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SessionData>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: IndexationsServices) => ({
  getUser: async () =>
    prisma.user
      .findUnique({ where: { dmId: _socket.data.user.id } })
      .then((user) => {
        if (!user) {
          console.info("Creating user for DM user", _socket.data.user.id);
          return prisma.user.create({
            data: {
              dmId: _socket.data.user.id,
            },
          });
        }
        return user;
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
