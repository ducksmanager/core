import axios from "axios";
import sharp from "sharp";
import type { Server, Socket } from "socket.io";

import type { NamespaceWithData, SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import CoaServices from "~dm-services/coa/types";
import { storyKinds } from "~dumili-types/storyKinds";
import {
  entry,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";
import { SocketClient } from "~socket.io-client-services";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const { services: coaServices } = socket.addNamespace<CoaServices>(
  CoaServices.namespaceEndpoint,
);

import { RequiredAuthMiddleware } from "../_auth";
import type { KumikoProcessedResult } from "./kumiko";
import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { indexationPayloadInclude } from "./types";

const getFullIndexation = (indexationId: string) =>
  prisma.indexation.findUnique({
    where: { id: indexationId },
    include: indexationPayloadInclude,
  });

const getIndexationMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  const indexationId = socket.nsp.name.split("/").pop()!;
  socket.data.indexation = await getFullIndexation(indexationId);

  next();
};

export default (io: Server) => {
  io.use(RequiredAuthMiddleware);

  (
    io.of(
      new RegExp(
        `^${Events.namespaceEndpoint.replace("{id}", "[0-9]{8}T[0-9]{9}")}$`,
      ),
    ) as NamespaceWithData<Events, SessionDataWithIndexation>
  )
    .use(RequiredAuthMiddleware)
    .use(getIndexationMiddleware)
    .on("connection", (indexationSocket) => {
      indexationSocket.on("addPage", async (pageNumber, url, callback) => {
        const { id: indexationId } = indexationSocket.data.indexation;
        const isFirstPage = pageNumber === 1;
        prisma.indexation
          .update({
            data: {
              pages: {
                create: {
                  pageNumber,
                  url,
                },
              },
            },
            where: {
              id: indexationId,
            },
          })
          .then(async () => {
            if (isFirstPage) {
              const newEntry = await createEntry(indexationId)
              await acceptStoryKindSuggestion((await prisma.storyKindSuggestion.findFirstOrThrow({
                where: {
                  entryId: newEntry.id,
                  kind: storyKinds.find(({ label }) => label === "Cover")!.code,
                },
                select: {
                  id: true,
                },
              })).id, newEntry.id)
            }
          })
          .then(callback);
      });

      indexationSocket.on("loadIndexation", async (callback) => {
        callback({ indexation: indexationSocket.data.indexation });
      });

      indexationSocket.on(
        "acceptIssueSuggestion",
        (suggestionId, callback) =>
          prisma.indexation.update({
            data: {
              acceptedIssueSuggestion: suggestionId === null ? { disconnect: true } : {
                connect: {
                  id: suggestionId,
                  indexationId: indexationSocket.data.indexation.id,
                },
              },
            },
            where: {
              id: indexationSocket.data.indexation.id,
            },
          }).then(() => callback({ status: "OK" }))
      );

      indexationSocket.on(
        "createStorySuggestion",
        (suggestion, callback) => prisma.storySuggestion.create({ data: suggestion }).then((createdStorySuggestion) => callback({ createdStorySuggestion }))
      );

      indexationSocket.on(
        "createIssueSuggestion",
        (suggestion, callback) => prisma.issueSuggestion.create({
          data: {
            ...suggestion,
            indexationId: indexationSocket.data.indexation.id,
          },
        }).then(({ id }) => callback({ suggestionId: id }))
      );

      indexationSocket.on("createOcrDetails", async (ocrDetails, callback) => {
        if (
          !indexationSocket.data.indexation.pages.some(
            ({ id }) => id === ocrDetails.page.connect!.id,
          )
        ) {
          callback({ error: "You are not allowed to update this resource" });
          return;
        }

        await prisma.aiOcrPossibleStory.create({
          data: ocrDetails,
        });
        callback({ status: "OK" });
      });

      indexationSocket.on(
        "acceptStorySuggestion",
        async (storySuggestionId, callback) => {
          const entry = indexationSocket.data.indexation.entries.find(
            ({ storySuggestions }) => storySuggestions.some(({ id }) => id === storySuggestionId),
          );
          if (!entry) {
            callback({ error: `This indexation does not have any entry with this suggestion`, errorDetails: JSON.stringify({ storySuggestionId }) });
            return;
          }

          await acceptStorySuggestion(storySuggestionId, entry.id);
          callback({ status: "OK" });
        },
      );

      indexationSocket.on(
        "acceptStoryKindSuggestion",
        async (storyKindSuggestionId, callback) => {
          const entry = indexationSocket.data.indexation.entries.find(
            ({ storyKindSuggestions }) => storyKindSuggestions.some(({ id }) => id === storyKindSuggestionId),
          );
          if (!entry) {
            callback({ error: `This indexation does not have any entry with this story kind suggestion`, errorDetails: JSON.stringify({ storyKindSuggestionId }) });
            return;
          }

          await acceptStoryKindSuggestion(storyKindSuggestionId, entry.id);
          callback({ status: "OK" });
        },
      );

      indexationSocket.on("runKumiko", async (callback) =>
        runKumiko(indexationSocket.data.indexation.pages.map(({ url }) => url))
          .then(async (panelsPerPage) => {
            const transactions: Prisma.PrismaPromise<any>[] = []
            // TODO create story kind suggestions on entries covering each page
            const entries = indexationSocket.data.indexation.entries;
            panelsPerPage.forEach((panelsOfPage, idx) => {
              const pageNumber = idx + 1;
              const inferredKind = inferStoryKindFromAiResults(
                panelsOfPage,
                pageNumber,
              );

              const page = indexationSocket.data.indexation.pages[idx];
              transactions.push(prisma.page.update({
                data: {
                  aiKumikoResultPanels: {
                    createMany: {
                      data: panelsOfPage,
                    },
                  },
                },
                where: {
                  id: page.id,
                }
              }))
            });

            await prisma.$transaction(transactions)

            callback({ status: "OK" });
          })
          .catch((err) => {
            console.error(err);
            callback({
              error: "Kumiko output could not be parsed",
            });
          }),
      );

      indexationSocket.on("runOcr", async (pageUrl, callback) => {
        const page = indexationSocket.data.indexation.pages.find(
          ({ url }) => url === pageUrl,
        );
        if (!page) {
          callback({ error: "Invalid page URL" });
        }
        prisma.aiKumikoResultPanel
          .findFirstOrThrow({
            include: {
              page: true,
            },
            where: {
              page: {
                url: pageUrl,
              },
            },
          })
          .then((firstPanel) =>
            axios<Buffer>({
              url: pageUrl,
              responseType: "arraybuffer",
            })
              .then(async ({ data: imageData }) =>
                sharp(imageData)
                  .extract(extendBoundaries(firstPanel, 20))
                  .toBuffer(),
              )
              .then((buffer) => runOcr(buffer.toString("base64")))
              .then(async (ocrResults) =>
                prisma.aiOcrResult
                  .createMany({
                    data: ocrResults.map(
                      ({
                        confidence,
                        text,
                        box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
                      }) => ({
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
                      }),
                    ),
                  })
                  .then(() =>
                    coaServices.searchStory(
                      ocrResults.map(({ text }) => text),
                      false,
                    ),
                  )
                  .then(({ results }) =>
                    prisma.aiOcrPossibleStory
                      .createMany({
                        data: results.map(({ storycode, score }) => ({
                          pageId: page!.id,
                          storyversioncode: storycode,
                          confidenceScore: score,
                        })),
                      })
                      .then(() => callback({ status: "OK" }))
                      .catch((err) => {
                        console.error(err);
                        callback({ error: "OCR error", errorDetails: err });
                      }),
                  ),
              ),
          );
      });

      indexationSocket.on("createEntry", async (callback) => createEntry(indexationSocket.data.indexation.id).then(callback));
    });
};

const inferStoryKindFromAiResults = (
  panelsOfPage: KumikoProcessedResult[],
  pageNumber: number,
) =>
  storyKinds.find(
    ({ label }) =>
      label ===
      (panelsOfPage.length === 1
        ? pageNumber === 1
          ? "Cover"
          : "Illustration"
        : "Story"),
  )!.code;

const acceptStorySuggestion = async (suggestionId: storySuggestion['id'] | null, entryId: entry['id']) =>
  prisma.entry.update({
    data: {
      acceptedStoryKind: suggestionId === null ? { disconnect: true } : {
        connect: {
          id: suggestionId,
        },
      },
    },
    where: {
      id: entryId,
    }
  })

const acceptStoryKindSuggestion = (
  suggestionId: storyKindSuggestion['id'] | null,
  entryId: entry['id'],
) =>
  prisma.entry.update({
    data: {
      acceptedStoryKind: suggestionId === null ? { disconnect: true } : {
        connect: {
          id: suggestionId,
        },
      },
    },
    where: {
      id: entryId,
    },
  });

const createEntry = async (indexationId: string) =>
  prisma.entry.create({
    data: {
      entirepages: 1,
      indexation: {
        connect: {
          id: indexationId,
        },
      },
      storyKindSuggestions: {
        createMany: {
          data: storyKinds.map(({ code }) => ({
            kind: code,
          })),
        }
      }
    },
  })
