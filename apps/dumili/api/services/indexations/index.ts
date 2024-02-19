import axios from "axios";
import sharp from "sharp";
import { Socket } from "socket.io";

import {
  NamespaceWithData,
  prisma,
  ServerWithData,
  SessionData,
  SessionDataWithIndexation,
} from "~/index";

import { RequiredAuthMiddleware } from "../_auth";
import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { IndexationEvents } from "./types";

const getFullIndexation = (indexationId: string) => prisma.indexation.findUnique({
  where: { id: indexationId },
  include: {
    acceptedIssueSuggestion: true,
    pages: true,
    issueSuggestions: true,
    entries: {
      include: {
        acceptedSuggestedStory: true,
        acceptedSuggestedStoryKind: true,
        storyKindSuggestions: true,
        storySuggestions: true
      },
      orderBy: {
        order: 'asc'
      }
    }
  }
});

const getIndexationsWithFirstPage = (userId: number) => prisma.indexation.findMany({
  where: {
    dmUserId: userId
  },
  include: {
    pages: {
      take: 1,
      orderBy: {
        pageNumber: 'asc'
      }
    }
  }
});

const getIndexationMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void
) => {
  const indexationId = socket.nsp.name.split("/").pop()!;
  socket.data.indexation = await getFullIndexation(indexationId);

  next();
};

export default (io: ServerWithData<SessionData>) => {
  io.use(RequiredAuthMiddleware);

  const indexationNamespace = io.of(
    new RegExp(`^${Events.namespaceEndpoint}\\/.+$`)
  ) as NamespaceWithData<IndexationEvents, SessionDataWithIndexation>;
  indexationNamespace
    .use(RequiredAuthMiddleware)
    .use(getIndexationMiddleware)
    .on("connection", (indexationSocket) => {
      indexationSocket.on("getIndexation", async (callback) => {
        callback({ indexation: indexationSocket.data.indexation });
      });

      indexationSocket.on('acceptIssueSuggestion', async (suggestion, callback) => {
        if (indexationSocket.data.indexation.id !== suggestion.indexationId) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        const createdIssueSuggestion = await prisma.issueSuggestion.create({
          data: suggestion
        });

        prisma.indexation.update({
          data: {
            acceptedIssueSuggestion: {
              connect: {
                id: createdIssueSuggestion.id
              }
            }
          },
          where: {
            id: suggestion.indexationId
          }
        })
        callback({ status: 'OK' })

      })

      indexationSocket.on('createStorySuggestion', async (suggestion, callback) => {
        if (!indexationSocket.data.indexation.entries.some(({ id }) => id === suggestion.entryId)) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await prisma.storySuggestion.create({
          data: suggestion
        });
        callback({ status: 'OK' })
      })

      indexationSocket.on('acceptStorySuggestion', async (suggestion, callback) => {
        const entry = indexationSocket.data.indexation.entries.find(({ id }) => id === suggestion.entryId);
        if (!entry) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await prisma.entry.update({
          data: {
            acceptedSuggestedStory: {
              connect: {
                id: suggestion.id
              }
            }
          },
          where: {
            id: entry.id
          }
        });
        callback({ status: 'OK' })
      })

      indexationSocket.on("getKumikoResults", async (callback) => {
        const output = await runKumiko(
          indexationSocket.data.indexation.pages.map(
            ({ url }) => url
          )
        );
        try {
          callback({ data: output });
        } catch (err) {
          console.error(err);
          console.error(output);
          callback({
            error: "Kumiko output could not be parsed",
          });
        }
      });

      indexationSocket.on("getOcrResults", async (pageUrl, callback) => {
        if (
          !indexationSocket.data.indexation.pages.some(
            ({ url }) => url === pageUrl
          )
        ) {
          callback({ error: "Invalid page URL" });
        }
        Promise.all([
          runKumiko([pageUrl]),
          axios({
            url: pageUrl,
            responseType: "arraybuffer",
          })
        ]).then(async ([[kumikoResultsForPage], { data: imageData }]) => {
          const firstPanel = kumikoResultsForPage.panels[0];
          const base64 = (
            await sharp(imageData as Buffer)
              .extract(extendBoundaries(firstPanel, 20))
              .toBuffer()
          ).toString("base64");
          return runOcr(base64)
        }).then((output) => {
          callback({ data: output });
        }).catch((err) => {
          callback({ error: "OCR error", errorDetails: err as string });
        })
      });

      indexationSocket.on('updateIndexation', async (indexation, callback) => {
        if (indexationSocket.data.indexation.id !== indexation.id) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await prisma.issueSuggestion.deleteMany({
          where: {
            indexationId: indexation.id
          }
        });

        await prisma.entry.deleteMany({
          where: {
            indexationId: indexation.id
          }
        });

        await prisma.entry.createMany({
          data: indexation.entries
        });

        callback()
      })
    });

  const namespace = io.of(Events.namespaceEndpoint) as NamespaceWithData<
    Events,
    SessionData
  >;
  namespace.use(RequiredAuthMiddleware);
  namespace.on("connection", async (socket) => {
    socket.on("getIndexations", async (callback) => {
      callback({
        indexations: await getIndexationsWithFirstPage(socket.data.user.id),
      });
    });
  });
};