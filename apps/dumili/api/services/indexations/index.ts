import axios from "axios";
import sharp from "sharp";
import { Socket } from "socket.io";

import {
  NamespaceWithData,
  prisma,
  SessionData,
  SessionDataWithIndexation,
} from "~/index";
import { entry, page, Prisma, storyKindSuggestion, storySuggestion } from "~/prisma/client_dumili";
import CoaServices from "~dm-services/coa/types";
import { storyKinds } from "~dumili-types/storyKinds";
import { useSocket } from "~socket.io-client-services/index";


const socket = useSocket(process.env.DM_SOCKET_URL!);
const coaServices = socket.addNamespace<CoaServices>(
  CoaServices.namespaceEndpoint
);

import { Server } from "socket.io";

import { RequiredAuthMiddleware } from "../_auth";
import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { IndexationEvents, indexationPayloadInclude } from "./types";

const getFullIndexation = (indexationId: string) => prisma.indexation.findUnique({
  where: { id: indexationId },
  include: indexationPayloadInclude
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

export default (io: Server) => {
  io.use(RequiredAuthMiddleware);

  (io.of(Events.namespaceEndpoint) as NamespaceWithData<
    Events,
    SessionData
  >).use(RequiredAuthMiddleware)
    .on("connection", async (socket) => {
      socket.on("getIndexations", async (callback) => {
        callback({
          indexations: await getIndexationsWithFirstPage(socket.data.user.id),
        });
      });
    });

  const indexationNamespace = io.of(
    new RegExp(`^${Events.namespaceEndpoint}\\/.+$`)
  ) as NamespaceWithData<IndexationEvents, SessionDataWithIndexation>;
  indexationNamespace
    .use(RequiredAuthMiddleware)
    .use(getIndexationMiddleware)
    .on("connection", (indexationSocket) => {
      indexationSocket.on("loadIndexation", async (callback) => {
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

        const { id } = await prisma.storySuggestion.create({
          data: suggestion
        });
        callback({ suggestionId: id })
      })

      indexationSocket.on('createOcrDetails', async (ocrDetails, callback) => {
        if (!indexationSocket.data.indexation.pages.some(({ id }) => id === ocrDetails.page.connect!.id)) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await prisma.aiOcrPossibleStory.create({
          data: ocrDetails
        });
        callback({ status: 'OK' })
      })

      indexationSocket.on('acceptStorySuggestion', async (suggestion, callback) => {
        const entry = indexationSocket.data.indexation.entries.find(({ id }) => id === suggestion.entryId);
        if (!entry) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await acceptStorySuggestion(suggestion);
        callback({ status: 'OK' })
      })

      indexationSocket.on('acceptStoryKindSuggestion', async (suggestion, callback) => {
        const entry = indexationSocket.data.indexation.entries.find(({ id }) => id === suggestion.entryId);
        if (!entry) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        await acceptStoryKindSuggestion(suggestion)
        callback({ status: 'OK' })
      })

      indexationSocket.on("runKumiko", async (callback) =>
        runKumiko(
          indexationSocket.data.indexation.pages.map(
            ({ url }) => url
          )
        ).then(async (panelsPerPage) => {
          const storyStoryKind = storyKinds.find(({ label }) => label === 'Story')!
          let previousPosition = String.fromCharCode(
            "a".charCodeAt(0) - 1);

          const indexationId = indexationSocket.data.indexation.id;
          const entriesToCreate: (Pick<entry, 'position'> & Pick<storyKindSuggestion, 'kind'> & Pick<page, 'pageNumber'> & { pages: { pageId: number, panels: typeof panelsPerPage[number] }[] })[] = []
          panelsPerPage.forEach((panelsOfPage, idx) => {
            const pageId = indexationSocket.data.indexation.pages[idx].id
            const inferredKind = storyKinds.find(
              ({ label }) =>
                label ===
                (panelsOfPage.length === 1
                  ? idx === 0
                    ? "Cover"
                    : "Illustration"
                  : "Story")
            )!.code;

            const page = { pageId, panels: panelsOfPage }

            // Don't create a new entry if both the previous one and this one are stories
            if (!(
              storyStoryKind.code === inferredKind &&
              storyStoryKind.code === entriesToCreate[entriesToCreate.length - 1]?.kind
            )) {
              const position = String.fromCharCode(previousPosition.charCodeAt(0) + 1)
              entriesToCreate.push({
                position,
                kind: inferredKind,
                pageNumber: idx + 1,
                pages: [page]
              })
              previousPosition = position
            }
            else {
              entriesToCreate[entriesToCreate.length - 1].pages.push(page)
            }
          })

          await prisma.$transaction(entriesToCreate.map(({ pages }, idx) =>
            prisma.page.update({
              where: {
                id: pages[idx].pageId
              },
              include: {
                aiKumikoResultPanels: true
              },
              data: {
                aiKumikoResultPanels: {
                  createMany: {
                    data: pages[idx].panels
                  }
                },
              }
            })
          ))

          await prisma.entryPage.deleteMany({
            where: {
              entry: {
                indexationId
              }
            },
          });
          await prisma.storyKindSuggestion.deleteMany({
            where: {
              entry: {
                indexationId
              }
            },
          });
          await prisma.storySuggestion.deleteMany({
            where: {
              entry: {
                indexationId
              }
            },
          });
          await prisma.entry.deleteMany({
            where: {
              indexationId
            },
          });

          await prisma.$transaction(entriesToCreate.map(({ position, pages }) =>
            prisma.entry.create({
              data: {
                indexationId,
                position,
                entryPages: {
                  createMany: {
                    data: pages.map(({ pageId }) => ({ pageId }))
                  }
                }
              },
            })));

          await prisma.$transaction(entriesToCreate.map(({ position, kind, pages }) => prisma.$queryRaw`
            INSERT INTO story_kind_suggestion (kind, ai_source_page_id, entry_id)
            VALUES (${kind}, ${pages[0].pageId}, (SELECT id FROM entry WHERE indexation_id = ${indexationId} AND position = ${position}))`
          ))

          await prisma.$transaction(entriesToCreate.map(({ position, kind }) => prisma.$queryRaw`
            UPDATE entry
            SET accepted_story_kind_suggested_id = (SELECT id FROM story_kind_suggestion WHERE entry_id = (SELECT id FROM entry WHERE indexation_id = ${indexationId} AND position = ${position}) AND kind = ${kind})`
          ))

          callback({ status: 'OK' });
        }).catch((err) => {
          console.error(err);
          callback({
            error: "Kumiko output could not be parsed",
          })
        }))

      indexationSocket.on("runOcr", async (pageUrl, callback) => {
        const page = indexationSocket.data.indexation.pages.find(
          ({ url }) => url === pageUrl
        )
        if (
          !page
        ) {
          callback({ error: "Invalid page URL" });
        }
        prisma.aiKumikoResultPanel.findFirstOrThrow({
          include: {
            page: true
          },
          where: {
            page: {
              url: pageUrl,
            },
          }
        }).then((firstPanel) =>
          axios<Buffer>({
            url: pageUrl,
            responseType: "arraybuffer",
          }).then(async ({ data: imageData }) =>
            sharp(imageData)
              .extract(extendBoundaries(firstPanel, 20))
              .toBuffer()).then((buffer) => runOcr(buffer.toString("base64"))).then(async (ocrResults) =>
                prisma.aiOcrResult.createMany({
                  data: ocrResults.map(({ confidence, text, box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] }) => ({
                    pageId: page!.id,
                    confidence,
                    text,
                    x1,
                    x2,
                    y1,
                    y2,
                    x3,
                    x4,
                    y3,
                    y4,
                  }))
                }).then(() =>
                (
                  coaServices.searchStory(
                    ocrResults.map(({ text }) => text),
                    false
                  )
                )
                ).then(({ results }) => prisma.aiOcrPossibleStory.createMany({
                  data: results.map(({ storycode, score }) => ({
                    pageId: page!.id,
                    storyversioncode: storycode,
                    confidenceScore: score
                  }))
                }).then(() => callback({ status: 'OK' })).catch((err) => {
                  console.error(err);
                  callback({ error: "OCR error", errorDetails: err });
                })
                )))
      })

      indexationSocket.on('updateIndexation', async (indexation, callback) => {
        if (indexationSocket.data.indexation.id !== indexation.id) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        // await prisma.issueSuggestion.deleteMany({
        //   where: {
        //     indexationId: indexation.id
        //   }
        // });

        // await prisma.entry.deleteMany({
        //   where: {
        //     indexationId: indexation.id
        //   }
        // });

        // await prisma.entry.createMany({
        //   data: indexation.entries
        // });

        callback()
      })
    });
};

const acceptStorySuggestion = (suggestion: storySuggestion) => prisma.entry.update({
  data: {
    acceptedSuggestedStoryKind: {
      connect: {
        id: suggestion.id
      }
    }
  },
  where: {
    id: suggestion.entryId
  }
});

const acceptStoryKindSuggestion = (suggestion: Prisma.storyKindSuggestionUncheckedCreateInput) =>
  prisma.entry.update({
    data: {
      acceptedSuggestedStoryKind: {
        connectOrCreate: {
          create: suggestion,
          where: {
            id: suggestion.id
          }
        }
      }
    },
    where: {
      id: suggestion.entryId
    }
  });