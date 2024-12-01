import type { Server } from "socket.io";

import type { NamespaceWithData, SessionData } from "~/index";
import { prisma } from "~/index";

import { RequiredAuthMiddleware } from "../_auth";
import Events, { indexationWithFirstPageAndAcceptedIssueSuggestion } from "./types";
import { COVER } from "~dumili-types/storyKinds";
import { acceptStoryKindSuggestion, createEntry } from "../indexation";

const getIndexationsWithFirstPage = (userId: number) =>
  prisma.indexation.findMany({
    where: {
      dmUserId: userId,
    },
    include: indexationWithFirstPageAndAcceptedIssueSuggestion,
  });

export default (io: Server) => {
  io.use(RequiredAuthMiddleware);

  (io.of(Events.namespaceEndpoint) as NamespaceWithData<Events, SessionData>)
    .use(RequiredAuthMiddleware)
    .on("connection", async (socket) => {
      socket.on("create", async (id, numberOfPages, callback) => {
        prisma.indexation
          .create({
            data: {
              id,
              dmUserId: socket.data.user.id,
              pages: {
                createMany: {
                  data: Array.from({ length: numberOfPages }).map(
                    (_, idx) => ({
                      pageNumber: idx + 1,
                    }),
                  ),
                },
              }
            }
          })
          .then(indexation => createEntry(indexation.id))
          .then(entry => acceptStoryKindSuggestion(entry.storyKindSuggestions.find(s => s.kind === COVER)!.id, entry.id))
          .then(callback);
      });
      socket.on("getIndexations", async (callback) =>
        getIndexationsWithFirstPage(socket.data.user.id).then(
          callback,
        )
      )
    });
};
