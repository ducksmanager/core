import axios from "axios";
import type { Server, Socket } from "socket.io";

import type { NamespaceWithData, SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import CoaServices from "~dm-services/coa/types";
import { storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import type {
  entry,
  page,
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
import { runOcr } from "./ocr";
import Events, { indexationPayloadInclude } from "./types";

const getFullIndexation = (indexationId: string) =>
  prisma.indexation.findUnique({
    where: { id: indexationId },
    include: indexationPayloadInclude,
  });

const setKumikoInferredPageStoryKinds = async (pages: page[]) => {
  const panelsPerPage = await runKumiko(pages.map(({ url }) => url));

  const transactions = panelsPerPage.map((panelsOfPage, idx) => {
    const page = pages[idx];
    console.log(
      `Kumiko: page ${page.pageNumber}: detected ${panelsOfPage.length} panels`,
    );

    const inferredStoryKind = inferStoryKindFromAiResults(
      panelsOfPage,
      idx + 1,
    );

    console.log(
      `Kumiko: page ${page.pageNumber}: inferred story kind is ${inferredStoryKind}`,
    );

    return prisma.page.update({
      data: {
        aiKumikoInferredStoryKind: inferredStoryKind,
        aiKumikoResultPanels: {
          createMany: {
            data: panelsOfPage,
          },
        },
      },
      where: {
        id: page.id,
      },
    });
  });
  await prisma.$transaction(transactions);
};

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
      const getEntryFromPage = async (pageId: page["id"]) =>
        indexationSocket.data.indexation.entries.find(({ id }) =>
          getEntryPages(indexationSocket.data.indexation, id).some(
            ({ id }) => id === pageId,
          ),
        );

      const setInferredEntryStoryKind = async (entryId: entry["id"]) => {
        const indexation = indexationSocket.data.indexation;
        const mostInferredStoryKind = (
          await prisma.page.groupBy({
            by: ["aiKumikoInferredStoryKind"],
            orderBy: {
              _count: {
                aiKumikoInferredStoryKind: "asc",
              },
            },
            where: {
              id: {
                in: getEntryPages(indexation, entryId).map(({ id }) => id),
              },
            },
          })
        ).pop()!.aiKumikoInferredStoryKind!;

        const entryIdx = indexationSocket.data.indexation.entries.findIndex(
          ({ id }) => id === entryId,
        );
        console.log(
          `Kumiko: entry #${entryIdx}: inferred story kind is ${mostInferredStoryKind}`,
        );

        await prisma.entry.update({
          where: {
            id: indexationSocket.data.indexation.entries[0].id,
          },
          data: {
            storyKindSuggestions: {
              updateMany: {
                data: {
                  isChosenByAi: true,
                },
                where: {
                  kind: mostInferredStoryKind,
                },
              },
            },
          },
        });
      };

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
              const newEntry = await createEntry(indexationId);
              await acceptStoryKindSuggestion(
                (
                  await prisma.storyKindSuggestion.findFirstOrThrow({
                    where: {
                      entryId: newEntry.id,
                      kind: storyKinds.find(({ label }) => label === "Cover")!
                        .code,
                    },
                    select: {
                      id: true,
                    },
                  })
                ).id,
                newEntry.id,
              );
            }
          })
          .then(callback);
      });

      indexationSocket.on("loadIndexation", async (callback) => {
        callback({ indexation: indexationSocket.data.indexation });
      });

      indexationSocket.on("acceptIssueSuggestion", (suggestionId, callback) =>
        prisma.indexation
          .update({
            data: {
              acceptedIssueSuggestion:
                suggestionId === null
                  ? { disconnect: true }
                  : {
                      connect: {
                        id: suggestionId,
                        indexationId: indexationSocket.data.indexation.id,
                      },
                    },
            },
            where: {
              id: indexationSocket.data.indexation.id,
            },
          })
          .then(() => callback({ status: "OK" })),
      );

      indexationSocket.on("createStorySuggestion", (suggestion, callback) =>
        prisma.storySuggestion
          .create({ data: suggestion })
          .then((createdStorySuggestion) =>
            callback({ createdStorySuggestion }),
          ),
      );

      indexationSocket.on("createIssueSuggestion", (suggestion, callback) =>
        prisma.issueSuggestion
          .create({
            data: {
              ...suggestion,
              indexationId: indexationSocket.data.indexation.id,
            },
          })
          .then(({ id }) => callback({ suggestionId: id })),
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
            ({ storySuggestions }) =>
              storySuggestions.some(({ id }) => id === storySuggestionId),
          );
          if (!entry) {
            callback({
              error: `This indexation does not have any entry with this suggestion`,
              errorDetails: JSON.stringify({ storySuggestionId }),
            });
            return;
          }

          await acceptStorySuggestion(storySuggestionId, entry.id);
          callback({ status: "OK" });
        },
      );

      indexationSocket.on(
        "acceptStoryKindSuggestion",
        async (entryId, storyKindSuggestionId, callback) => {
          const entry = indexationSocket.data.indexation.entries.find(
            ({ storyKindSuggestions }) =>
              storyKindSuggestions.some(
                ({ id }) => id === storyKindSuggestionId,
              ),
          );
          if (!entry) {
            callback({
              error: `This indexation does not have any entry with this story kind suggestion`,
              errorDetails: JSON.stringify({ storyKindSuggestionId }),
            });
            return;
          }
          if (entry.id !== entryId) {
            callback({
              error: `This indexation does not have any entry with this ID`,
              errorDetails: JSON.stringify({ entryId }),
            });
            return;
          }

          await acceptStoryKindSuggestion(storyKindSuggestionId, entry.id);
          callback({ status: "OK" });
        },
      );

      indexationSocket.on(
        "updateEntryLength",
        async (entryId, data, callback) => {
          const entry = indexationSocket.data.indexation.entries.find(
            ({ id }) => id === entryId,
          );
          if (!entry) {
            callback({
              error: `This indexation does not have any entry with this ID`,
              errorDetails: JSON.stringify({ entryId }),
            });
            return;
          }

          await prisma.entry.update({
            data,
            where: {
              id: entryId,
            },
          });
          callback({ status: "OK" });
        },
      );

      indexationSocket.on("runKumikoOnPage", async (pageId, callback) => {
        const { indexation } = indexationSocket.data;
        const page = indexation.pages.find(({ id }) => id === pageId)!;

        await setKumikoInferredPageStoryKinds([page]);
        const entry = (await getEntryFromPage(pageId))!;
        await setInferredEntryStoryKind(entry.id);

        callback({ status: "OK" });
      });

      indexationSocket.on("runKumiko", async (entryId, callback) => {
        const { indexation } = indexationSocket.data;
        const pages = getEntryPages(indexation, entryId);

        await setKumikoInferredPageStoryKinds(pages);
        await setInferredEntryStoryKind(entryId);

        callback({ status: "OK" });
      });

      indexationSocket.on("runOcr", async (entryId, callback) => {
        const { indexation } = indexationSocket.data;

        const entry = indexation.entries.find(({ id }) => id === entryId);
        if (entry?.acceptedStoryKind?.kind === "n") {
          const entryPages = getEntryPages(indexation, entryId);
          const results = await Promise.all(
            entryPages
              .map(({ aiKumikoResultPanels, url }) => ({
                pageUrl: url,
                panel: aiKumikoResultPanels[0],
              }))
              .map(({ panel, pageUrl }, idx) =>
                axios<Buffer>({
                  url: pageUrl.replace(
                    "/pg_",
                    `/c_crop,h_${panel.height + 20},w_${panel.width + 20},x_${panel.x},y_${panel.y}/pg_`,
                  ),
                  responseType: "arraybuffer",
                }).then(({ data }) =>
                  runOcr(data.toString("base64")).then((ocrResults) => ({
                    pageId: entryPages[idx].id,
                    ocrResults,
                  })),
                ),
              ),
          );

          prisma.aiOcrResult.createMany({
            data: results
              .map(({ pageId, ocrResults }) =>
                ocrResults.map(
                  ({
                    confidence,
                    text,
                    box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
                  }) => ({
                    pageId,
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
              )
              .flat(),
          });

          await prisma.$transaction(
            (
              await Promise.all(
                results.map(({ ocrResults }) =>
                  coaServices.searchStory(
                    ocrResults.map(({ text }) => text),
                    false,
                  ),
                ),
              )
            )
              .map(({ results: searchResults }, idx) => [
                prisma.storySuggestion.deleteMany({
                  where: {
                    entryId,
                  },
                }),
                prisma.storySuggestion.createMany({
                  data: searchResults.map(({ storycode }) => ({
                    entryId,
                    storycode,
                  })),
                }),
                prisma.aiOcrPossibleStory.createMany({
                  data: searchResults.map(({ storycode, score }) => ({
                    pageId: entryPages[idx]!.id,
                    storycode,
                    confidence: score,
                  })),
                }),
              ])
              .flat(),
          );

          callback({ status: "OK" });
        } else {
          callback({
            error: "This entry is not a story",
            errorDetails: `Entry ID: ${entryId}`,
          });
        }
      });

      indexationSocket.on("createEntry", async (callback) =>
        createEntry(indexationSocket.data.indexation.id).then(callback),
      );
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

const acceptStorySuggestion = async (
  suggestionId: storySuggestion["id"] | null,
  entryId: entry["id"],
) =>
  prisma.entry.update({
    data: {
      acceptedStoryKind:
        suggestionId === null
          ? { disconnect: true }
          : {
              connect: {
                id: suggestionId,
              },
            },
    },
    where: {
      id: entryId,
    },
  });

const acceptStoryKindSuggestion = (
  suggestionId: storyKindSuggestion["id"] | null,
  entryId: entry["id"],
) =>
  prisma.entry.update({
    data: {
      acceptedStoryKind:
        suggestionId === null
          ? { disconnect: true }
          : {
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
        },
      },
    },
  });
