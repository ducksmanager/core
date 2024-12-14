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
import type { entry, Prisma, storyKindSuggestion } from "~prisma/client_dumili";
import { SocketClient } from "~socket.io-client-services";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const { services: coaServices } = socket.addNamespace<CoaServices>(
  CoaServices.namespaceEndpoint,
);

import { RequiredAuthMiddleware } from "../_auth";
import type { KumikoProcessedResult } from "./kumiko";
import { runKumiko } from "./kumiko";
import { runOcr } from "./ocr";
import type { ServerSentEvents } from "./types";
import Events, { indexationPayloadInclude } from "./types";

const getFullIndexation = (indexationId: string) =>
  prisma.indexation
    .findUnique({
      where: { id: indexationId },
      include: indexationPayloadInclude,
    })
    .then((indexation) => {
      if (indexation) {
        indexation.pages = indexation.pages.sort(
          (a, b) => a.pageNumber - b.pageNumber,
        );
      }
      return indexation;
    });

const getIndexationMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  const indexationId = socket.nsp.name.split("/").pop()!;
  if (!indexationId) {
    next(new Error("No indexation ID provided"));
    return;
  }
  socket.data.indexation = await getFullIndexation(indexationId);

  next();
};

export default (io: Server) => {
  (
    io.of(
      new RegExp(
        `^${Events.namespaceEndpoint.replace("{id}", "[0-9]{8}T[0-9]{9}")}$`,
      ),
    ) as NamespaceWithData<Events, ServerSentEvents, SessionDataWithIndexation>
  )
    .use(RequiredAuthMiddleware)
    .use(getIndexationMiddleware)
    .on("connection", (indexationSocket) => {
      const { indexation } = indexationSocket.data;

      const setKumikoInferredPageStoryKinds = async (
        page: Prisma.pageGetPayload<{ include: { image: true } }>,
        force = false,
      ) => {
        if (!page.image) {
          console.info(`Kumiko: page ${page.pageNumber}: no image`);
          return null;
        }
        if (page.image?.aiKumikoInferredStoryKind && !force) {
          console.info(`Kumiko: page ${page.pageNumber}: already inferred`);
          return null;
        }
        indexationSocket.emit("setKumikoInferredPageStoryKinds", page.id);
        const panelsPerPage = await runKumiko([page.image.url]);
        const panelsOfPage = panelsPerPage[0];
        console.info(
          `Kumiko: page ${page.pageNumber}: detected ${panelsOfPage.length} panels`,
        );

        const inferredStoryKind = inferStoryKindFromAiResults(
          panelsOfPage,
          page.pageNumber,
        );

        console.log(
          `Kumiko: page ${page.pageNumber}: inferred story kind is ${inferredStoryKind}`,
        );

        const updatedImage = prisma.image.update({
          include: {
            aiKumikoResultPanels: true,
          },
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
            id: page.image.id,
          },
        });

        indexationSocket.emit("setKumikoInferredPageStoryKindsEnd", page.id);

        return updatedImage;
      };

      const runOcrOnPage = async (
        image: Prisma.imageGetPayload<{
          include: { aiKumikoResultPanels: true };
        }>,
      ) => {
        if (!image) {
          throw new Error("This page does not have an image URL associated");
        }

        const firstPanel = image.aiKumikoResultPanels[0];
        if (!firstPanel) {
          throw new Error("This page does not have any panels");
        }
        const firstPanelUrl = image.url.replace(
          "/pg_",
          `/c_crop,h_${firstPanel.height},w_${firstPanel.width},x_${firstPanel.x},y_${firstPanel.y},pg_`,
        );

        const ocrResults = await runOcr(firstPanelUrl);

        await prisma.image.update({
          where: {
            id: image.id,
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
          },
        });
      };

      const createStorySuggestions = async (entryId: entry["id"]) => {
        const entry = indexation.entries.find(({ id }) => id === entryId);
        if (entry?.acceptedStoryKind?.kind === STORY) {
          const firstPageNumberOfEntry = getEntryPages(indexation, entryId)[0]
            .pageNumber;
          const ocrResults = (
            await prisma.page.findUnique({
              include: {
                image: {
                  include: {
                    aiOcrResults: true,
                  },
                },
              },
              where: {
                imageId: {
                  not: null,
                },
                indexationId_pageNumber: {
                  indexationId: indexation.id,
                  pageNumber: firstPageNumberOfEntry,
                },
              },
            })
          )?.image?.aiOcrResults;

          if (!ocrResults) {
            throw new Error(`No OCR results found for this entry`);
          }

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

          const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;

          const newEntry = await prisma.entry.update({
            include: {
              storySuggestions: true,
            },
            where: {
              id: entryId,
            },
            data: {
              storySuggestions: {
                create: storyResults.map(({ storycode, score }) => ({
                  storycode,
                  isChosenByAi: true,
                  ocrDetails: {
                    create: {
                      score,
                    },
                  },
                })),
              },
            },
          });
          const acceptedStorySuggestionId = newEntry.storySuggestions.find(
            ({ storycode }) => storycode === currentlyAcceptedStorycode,
          )?.id;
          if (acceptedStorySuggestionId) {
            await prisma.entry.update({
              where: {
                id: entryId,
              },
              data: {
                acceptedStory: {
                  connect: {
                    id: acceptedStorySuggestionId,
                  },
                },
              },
            });
          }
        } else {
          throw new Error("This entry is not a story");
        }
      };

      const setInferredEntryStoryKind = async (entryId: entry["id"]) => {
        indexationSocket.emit("setInferredEntryStoryKind", entryId);
        const indexation = indexationSocket.data.indexation;
        const mostInferredStoryKind = (
          await prisma.image.groupBy({
            by: ["aiKumikoInferredStoryKind"],
            orderBy: {
              _count: {
                aiKumikoInferredStoryKind: "asc",
              },
            },
            where: {
              id: {
                in: getEntryPages(indexation, entryId)
                  .filter(({ imageId }) => !!imageId)
                  .map(({ imageId }) => imageId!),
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
              deleteMany: {
                isChosenByAi: true,
              },
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
        indexationSocket.emit("setInferredEntryStoryKindEnd", entryId);
      };

      indexationSocket.on("setPageUrl", async (id, url, callback) => {
        if (
          !indexationSocket.data.indexation.pages.some(
            ({ id: pageId }) => pageId === id,
          )
        ) {
          callback({
            error: "This indexation does not have any page with this ID",
          });
          return;
        }
        prisma.page
          .update({
            include: {
              image: {
                include: {
                  aiKumikoResultPanels: true,
                },
              },
            },
            data: {
              image: url
                ? {
                    connectOrCreate: {
                      create: {
                        url,
                      },
                      where: {
                        url,
                      },
                    },
                  }
                : { disconnect: true },
            },
            where: {
              id,
            },
          })
          .then(async (page) => {
            const updatedImage = await setKumikoInferredPageStoryKinds(page);
            if (updatedImage) {
              try {
                await runOcrOnPage(updatedImage);
              } catch (error) {
                console.error(error);
              }
            }
          })
          .then(() => callback("OK"));
      });

      indexationSocket.on("deleteIndexation", async (callback) => {
        const { id: indexationId } = indexationSocket.data.indexation;
        await prisma.indexation.delete({
          where: {
            id: indexationId,
          },
        });
        callback();
      });

      indexationSocket.on("loadIndexation", async (callback) => {
        callback({ indexation: indexationSocket.data.indexation });
      });
      indexationSocket.on(
        "swapPageUrls",
        async (pageNumber1, pageNumber2, callback) => {
          // In 2 steps so that we don't have to deal with unique constraints
          prisma.indexation
            .update({
              data: {
                pages: {
                  updateMany: [
                    {
                      data: {
                        pageNumber: -pageNumber1,
                      },
                      where: {
                        pageNumber: pageNumber1,
                      },
                    },
                    {
                      data: {
                        pageNumber: -pageNumber2,
                      },
                      where: {
                        pageNumber: pageNumber2,
                      },
                    },
                  ],
                },
              },
              where: {
                id: indexationSocket.data.indexation.id,
              },
            })
            .then(() =>
              prisma.indexation.update({
                include: {
                  pages: true,
                  entries: true,
                },
                data: {
                  pages: {
                    updateMany: [
                      {
                        data: {
                          pageNumber: pageNumber2,
                        },
                        where: {
                          pageNumber: -pageNumber1,
                        },
                      },
                      {
                        data: {
                          pageNumber: pageNumber2,
                        },
                        where: {
                          pageNumber: -pageNumber2,
                        },
                      },
                    ],
                  },
                },
                where: {
                  id: indexationSocket.data.indexation.id,
                },
              }),
            )
            .then((indexation) =>
              new Set(
                indexation.pages
                  .filter(({ pageNumber }) =>
                    [pageNumber1, pageNumber2].includes(pageNumber),
                  )
                  .map(({ id }) => getEntryFromPage(indexation, id)!.id),
              )
                .values()
                .map((id) => setInferredEntryStoryKind(id)),
            )
            .then(() => callback({ status: "OK" }));
        },
      );

      indexationSocket.on("acceptIssueSuggestion", (suggestionId, callback) => {
        if (
          !indexationSocket.data.indexation.issueSuggestions.some(
            ({ id }) => id === suggestionId,
          )
        ) {
          callback({
            error: "This issue suggestion does not exist in this indexation",
          });
          return;
        }
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
          .then(() => callback({ status: "OK" }));
      });

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

      indexationSocket.on("updateIndexation", (suggestion, callback) =>
        prisma.indexation
          .update({
            data: suggestion,
            where: {
              id: indexationSocket.data.indexation.id,
            },
          })
          .then(() => callback({ status: "OK" })),
      );
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

          await prisma.entry.update({
            data: {
              acceptedStorySuggestionId: storySuggestionId,
            },
            where: {
              id: entry.id,
            },
          });
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

      indexationSocket.on("updateEntry", async (entryId, data, callback) => {
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
        indexationSocket.data.indexation = (await getFullIndexation(
          indexationSocket.data.indexation.id,
        ))!;

        await setInferredEntryStoryKind(entryId);

        if (entry?.acceptedStoryKind?.kind === STORY) {
          try {
            await createStorySuggestions(entryId);
          } catch (error) {
            console.log((error as { message: string }).message);
          }
        }
        callback({ status: "OK" });
      });

      indexationSocket.on(
        "updateNumberOfPages",
        async (numberOfPages, callback) => {
          if (numberOfPages < 4 || numberOfPages > 996) {
            callback({
              error: `Invalid number of pages`,
              errorDetails: JSON.stringify({ numberOfPages }),
            });
            return;
          }
          const currentMaxPageNumber = Math.max(
            ...indexationSocket.data.indexation.pages.map(
              ({ pageNumber }) => pageNumber,
            ),
          );
          await prisma.indexation.update({
            data: {
              pages: {
                deleteMany: {
                  pageNumber: {
                    gt: numberOfPages,
                  },
                },
                createMany: {
                  data: Array.from({
                    length: numberOfPages - currentMaxPageNumber,
                  }).map((_, idx) => ({
                    pageNumber: currentMaxPageNumber + idx + 1,
                  })),
                },
              },
            },
            where: {
              id: indexationSocket.data.indexation.id,
            },
          });

          callback({ status: "OK" });
        },
      );

      indexationSocket.on("runKumikoOnPage", async (pageId, callback) => {
        const { indexation } = indexationSocket.data;
        const page = await prisma.page.findUnique({
          include: {
            image: true,
          },
          where: {
            id: pageId,
            indexationId: indexation.id,
          },
        });

        if (!page) {
          callback({
            error: `This indexation does not have any page with this ID`,
            errorDetails: JSON.stringify({ pageId }),
          });
          return;
        }

        const entry = getEntryFromPage(indexation, pageId)!;
        await setInferredEntryStoryKind(entry.id);

        callback({ status: "OK" });
      });

      indexationSocket.on(
        "createStorySuggestions",
        async (entryId, callback) => {
          try {
            await createStorySuggestions(entryId);
            callback({ status: "OK" });
          } catch (error) {
            callback({
              error: error as
                | "No OCR results found for this entry"
                | "This entry does not have a page URL associated"
                | "This entry is not a story",
              errorDetails: `Entry ID: ${entryId}`,
            });
          }
        },
      );

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

export const acceptStoryKindSuggestion = (
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

export const createEntry = async (indexationId: string) =>
  prisma.entry.create({
    include: {
      storyKindSuggestions: true,
    },
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
