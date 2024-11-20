import type { Server, Socket } from "socket.io";

import type { NamespaceWithData, SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import CoaServices from "~dm-services/coa/types";
import {
  COVER,
  ILLUSTRATION,
  STORY,
  storyKinds,
} from "~dumili-types/storyKinds";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";
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
          deleteMany: {},
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
            id: entryId,
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
                      kind: COVER,
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

      indexationSocket.on("updateIssueSuggestion", (suggestion, callback) =>
        prisma.indexation
          .update({
            data: {
              acceptedIssueSuggestion: {
                update: suggestion,
              },
            },
            where: {
              id: indexationSocket.data.indexation.id,
            }
          })
          .then(() => callback({ status: "OK" })),
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
        async (entryId, storySuggestionId, callback) => {
          const entry = indexationSocket.data.indexation.entries.find(
            ({ id, storySuggestions }) =>
              (entryId === id && storySuggestionId === null) ||
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
        "updateEntry",
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
        const entry = getEntryFromPage(indexation, pageId)!;
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
        if (entry?.acceptedStoryKind?.kind === STORY) {
          const {
            url,
            aiKumikoResultPanels,
            id: pageId,
          } = getEntryPages(indexation, entryId)[0]!;
          const firstPanel = aiKumikoResultPanels[0];
          const firstPanelUrl = url.replace(
            "/pg_",
            `/c_crop,h_${firstPanel.height},w_${firstPanel.width},x_${firstPanel.x},y_${firstPanel.y},pg_`,
          );

          const ocrResults = await runOcr(firstPanelUrl);

          const { results: searchResults } = await coaServices.searchStory(
            ocrResults.map(({ text }) => text),
            false,
          );

          const { stories: storyDetails } = await coaServices.getStoryDetails(
            searchResults.map(({ storycode }) => storycode),
          );

          const { storyversions: storyversionDetails } =
            await coaServices.getStoryversionsDetails(
              searchResults.map(
                ({ storycode }) =>
                  storyDetails![storycode].originalstoryversioncode!,
              ),
            );

          const storyResults = searchResults.filter(
            ({ storycode }) =>
              storyversionDetails![
                storyDetails![storycode].originalstoryversioncode!
              ].kind === STORY,
          );

          await prisma.page.update({
            where: {
              id: pageId,
            },
            data: {
              aiOcrResults: {
                deleteMany: {},
                create: ocrResults.map(
                  ({
                    confidence,
                    text,
                    box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
                  }) => ({
                    confidence,
                    text,
                    x1,
                    y1,
                    x2,
                    y2,
                    x3,
                    y3,
                    x4,
                    y4,
                  }),
                ),
              },
              aiOcrPossibleStories: {
                deleteMany: {},
                create: storyResults.map(({ storycode, score }) => ({
                  score,
                  storySuggestion: {
                    create: {
                      storycode,
                      entryId,
                      isChosenByAi: true,
                    },
                  },
                })),
              },
            },
          });

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
  panelsOfPage.length === 1 ? (pageNumber === 1 ? COVER : ILLUSTRATION) : STORY;

const acceptStorySuggestion = async (
  suggestionId: storySuggestion["id"] | null,
  entryId: entry["id"],
) =>
  prisma.entry.update({
    data: {
      acceptedStorySuggestionId: suggestionId,
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
      acceptedStoryKindSuggestionId: suggestionId,
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
          data: (Object.keys(storyKinds) as (keyof typeof storyKinds)[]).map(
            (code) => ({
              kind: code,
            }),
          ),
        },
      },
    },
  });
