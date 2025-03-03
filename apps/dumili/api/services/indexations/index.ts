import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { COVER } from "~dumili-types/storyKinds";
import type { Prisma, user } from "~prisma/client_dumili";

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
  getUser: async () => (prisma.user.findUnique({ where: { dmId: _socket.data.user.id } }).then((user) => {
    if (!user) {
      console.info('Creating user for DM user', _socket.data.user.id);
      return prisma.user.create({
        data: {
          dmId: _socket.data.user.id,
          inducksUsername: "change me"
        },
      });
    }
    return user;
  })),

  updateUser: async (input: Pick<user, 'inducksUsername'>) =>
    prisma.user.update({
      where: { dmId: _socket.data.user.id },
      data: input,
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
