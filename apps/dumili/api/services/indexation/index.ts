import "~group-by";

import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import {
  type ServerSentStartEndEvents,
  useSocketEvents,
} from "socket-call-server";

import { STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import type {
  aiKumikoResult,
  entry,
  indexation,
  issueSuggestion,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";

import type { SessionDataWithIndexation } from "../../index";
import { prisma } from "../../index";
import { RequiredAuthMiddleware } from "../_auth";
import namespaces from "../namespaces";
import { runKumikoOnPages } from "./kumiko";
import { runOcrOnImage } from "./ocr";
import { getStoriesFromImage, getStoriesFromKeywords } from "./story-search";

const indexationPayloadInclude = {
  user: true,
  pages: {
    orderBy: {
      pageNumber: "asc",
    },
    include: {
      image: {
        include: {
          aiKumikoResult: {
            include: {
              detectedPanels: true,
              inferredStoryKindRows: true,
            },
          },
          aiOcrResult: {
            include: {
              matches: true,
              stories: {
                include: {
                  storySuggestion: true,
                },
              },
            },
          },
          aiStorySearchResult: {
            include: {
              stories: {
                include: {
                  storySuggestion: true,
                },
              },
            },
          },
        },
      },
    },
  },
  acceptedIssueSuggestion: {
    include: {
      ai: true,
    },
  },
  issueSuggestions: {
    include: {
      ai: true,
    },
  },
  entries: {
    include: {
      acceptedStory: {
        include: {
          ocrDetails: true,
          storySearchDetails: true,
        },
      },
      acceptedStoryKind: { include: { ai: true, storyKindRows: true } },
      storyKindSuggestions: { include: { ai: true, storyKindRows: true } },
      storySuggestions: {
        include: {
          ai: true,
          ocrDetails: true,
          storySearchDetails: true,
        },
      },
    },
  },
} as const;

export type FullIndexation = Prisma.indexationGetPayload<{
  include: typeof indexationPayloadInclude;
}>;

export type FullEntry = FullIndexation["entries"][number];

export type IndexationServerSentStartEvents = {
  reportSetKumikoInferredPageStoryKinds: (pageId: number) => void;
  reportSetInferredEntryStoryKind: (entryId: number) => void;
  reportCreateAiStorySuggestions: (entryId: number) => void;
  reportRunOcrOnImage: (imageId: number) => void;
  reportRunStorySearchOnImage: (imageId: number) => void;
};

export type IndexationServerSentStartEndEvents =
  ServerSentStartEndEvents<IndexationServerSentStartEvents> & {
    indexationUpdated: (indexation: FullIndexation) => void;
  };

export type IndexationSocket = Socket<
  object,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>;

const isAiRunning: Record<string, boolean> = {};
export const getFullIndexation = (
  services: IndexationServices,
  indexationId: string,
  runAi: boolean = true
) =>
  prisma.indexation
    .findUnique({
      where: { id: indexationId, dmUserId: services._socket.data.user.id },
      include: indexationPayloadInclude,
    })
    .then((indexation) => {
      if (indexation) {
        indexation.entries = indexation.entries.sort(
          (a, b) => a.position - b.position
        );
        if (runAi && !(indexationId in isAiRunning)) {
          isAiRunning[indexationId] = true;
          runKumikoOnPages(services, indexation)
            .then(() =>
              setInferredEntriesStoryKinds(services, indexation.entries)
            )
            .then(() => createAiStorySuggestions(services, indexation))
            .finally(() => {
              delete isAiRunning[indexationId];
              refreshIndexation(services, false, indexationId);
            });
        }
      }
      return indexation;
    });

export const refreshIndexation = async (
  services: IndexationServices,
  runAi: boolean = true,
  id = services._socket.data.indexation.id
) => {
  services._socket.data.indexation = (await getFullIndexation(
    services,
    id,
    runAi
  ))!;
  services.indexationUpdated(services._socket.data.indexation);
};

const createAiStorySuggestions = async (
  services: IndexationServices,
  indexation: FullIndexation
) => {
  for (const entry of indexation.entries) {
    if (entry.acceptedStoryKind?.storyKindRows?.kind === STORY) {
      const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;

      const firstPageOfEntry = getEntryPages(indexation, entry.id)[0];

      if (!firstPageOfEntry.image) {
        continue;
      }

      services.reportCreateAiStorySuggestions(entry.id);

      for (const { name, field, storySuggestionRelationship } of [
        {
          name: "image-based story search",
          field: "aiStorySearchResult",
          storySuggestionRelationship: "storySearchDetails",
        },
        {
          name: "OCR-based story search",
          field: "aiOcrResult",
          storySuggestionRelationship: "ocrDetails",
        },
      ] as const) {
        const cachedResults = firstPageOfEntry.image[field]?.stories.map(
          ({ storySuggestion: { storycode } }) => ({
            type: storySuggestionRelationship,
            storycode,
          })
        );

        if (cachedResults) {
          if (cachedResults.length) {
            console.log(
              `Entry starting at page ${entry.position}: ${cachedResults.length} ${name} matches found (cached)`
            );
            break;
          } else {
            console.log(
              `Entry starting at page ${entry.position}: No ${name} matches found (cached)`
            );
            continue;
          }
        } else {
          const results =
            field === "aiStorySearchResult"
              ? await getStoriesFromImage(
                  firstPageOfEntry.image,
                  entry.position === 1
                )
              : await getStoriesFromKeywords(
                  (
                    await runOcrOnImage(
                      services,
                      entry.position,
                      firstPageOfEntry.image
                    )
                  ).map(({ text }) => text)
                );
          if ("error" in results) {
            console.error(results.error);
          } else {
            const newAiResult = await (
              prisma[field] as unknown as {
                create: typeof prisma.aiOcrResult.create;
              }
            ).create({
              data: {},
            });

            await prisma.image.update({
              where: {
                id: firstPageOfEntry.image.id,
              },
              data: {
                [`${field}Id`]: newAiResult.id,
              },
            });
            if (!results.stories.length) {
              console.info(
                `Entry starting at page ${entry.position}: No ${name} results found`
              );
            } else {
              console.log(
                `Entry starting at page ${entry.position}: ${results.stories.length} ${name} matches found`
              );
              await prisma.storySuggestionAi.deleteMany({
                where: {
                  storySuggestion: {
                    entryId: entry.id,
                  },
                },
              });

              for (const story of results.stories) {
                await prisma.storySuggestion.create({
                  data: {
                    [storySuggestionRelationship]: {
                      create: {
                        score: story.score,
                        [`${field}Id`]: newAiResult.id,
                      },
                    },
                    storycode: story.storycode,
                    entry: {
                      connect: {
                        id: entry.id,
                      },
                    },
                  },
                });
              }

              const newEntry = (await prisma.entry.findUnique({
                include: {
                  storySuggestions: {
                    include: {
                      [storySuggestionRelationship]: true,
                    },
                  },
                },
                where: {
                  id: entry.id,
                }
              }))!;
              const acceptedStorySuggestionId = newEntry.storySuggestions.find(
                ({ storycode }) => storycode === currentlyAcceptedStorycode
              )?.id;
              // If no story is currently accepted, we accept the first story suggestion
              if (acceptedStorySuggestionId) {
                await prisma.entry.update({
                  where: {
                    id: entry.id,
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
              break;
            }
          }
        }
      }

      services.reportCreateAiStorySuggestionsEnd(entry.id);
    } else {
      console.log(`Entry ${entry.id}: This entry is not a story`);
    }
  }
};

const setInferredEntriesStoryKinds = async (
  services: IndexationServices,
  entries: FullIndexation["entries"],
  force?: boolean
) => {
  for (const entry of entries) {
    if (entry.storyKindSuggestions.some(({ ai }) => ai) && !force) {
      console.log(`Entry ${entry.id} already has an inferred story kind`);
      continue;
    }

    services.reportSetInferredEntryStoryKind(entry.id);
    const { indexation } = services._socket.data;
    const pagesInferredStoryKinds = await prisma.image.findMany({
      include: {
        aiKumikoResult: true,
      },
      where: {
        id: {
          in: getEntryPages(indexation, entry.id)
            .filter(({ imageId }) => !!imageId)
            .map(({ imageId }) => imageId!),
        },
      },
    });

    if (!pagesInferredStoryKinds.length) {
      console.log(
        `Entry ${entry.id}: No pages with inferred story kinds found`
      );
    } else {
      const mostInferredStoryKind = Object.entries(
        (
          pagesInferredStoryKinds.filter(
            ({ aiKumikoResult }) => aiKumikoResult !== null
          ) as { aiKumikoResult: aiKumikoResult }[]
        )
          .map(({ aiKumikoResult: { id, inferredStoryKindRowsStr } }) => ({
            id,
            inferredStoryKindRowsStr,
          }))
          .groupBy("inferredStoryKindRowsStr", "id[]")
      ).sort((a, b) => b[1].length - a[1].length)[0][0];

      const entryIdx = services._socket.data.indexation.entries.findIndex(
        ({ id }) => id === entry.id
      );
      console.log(
        `Kumiko: entry #${entryIdx}: inferred story kind and number of rows are ${mostInferredStoryKind}`
      );

      await prisma.storyKindSuggestionAi.deleteMany({
        where: {
          suggestionId: {
            in: indexation.entries[entryIdx].storyKindSuggestions.map(
              ({ id }) => id
            ),
          },
        },
      });

      if (mostInferredStoryKind) {
        console.log(
          "Story kind suggestions: ",
          indexation.entries[entryIdx].storyKindSuggestions
        );
        const suggestion = indexation.entries[
          entryIdx
        ].storyKindSuggestions.find(
          ({ storyKindRowsStr }) => storyKindRowsStr === mostInferredStoryKind
        );
        if (suggestion) {
          await prisma.storyKindSuggestionAi.create({
            data: {
              suggestionId: suggestion.id,
            },
          });
        } else {
          console.warn("No suggestion found for", mostInferredStoryKind);
        }
      }
    }

    services.reportSetInferredEntryStoryKindEnd(entry.id);
  }
};

export type IndexationServices = NamespaceProxyTarget<
  Socket<
    typeof listenEvents,
    IndexationServerSentStartEndEvents,
    object,
    SessionDataWithIndexation
  >,
  IndexationServerSentStartEndEvents
>;

const listenEvents = (services: IndexationServices) => ({
  setPageUrl: async (id: number, url: string | null) => {
    if (
      !services._socket.data.indexation.pages.some(
        ({ id: pageId }) => pageId === id
      )
    ) {
      return {
        error: "This indexation does not have any page with this ID",
      };
    }
    return prisma.page
      .update({
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
      .then(async () => {
        await refreshIndexation(services);
        return "OK" as const;
      });
  },

  deleteIndexation: async () => {
    const { id: indexationId } = services._socket.data.indexation;
    await prisma.indexation.delete({
      where: {
        id: indexationId,
      },
    });
  },

  loadIndexation: async () => {
    services.reportSetKumikoInferredPageStoryKinds(1);
    return { indexation: services._socket.data.indexation };
  },

  deleteEntry: async (entryId: entry["id"]) => {
    const { indexation } = services._socket.data;
    const entry = indexation.entries.find(({ id }) => id === entryId);
    if (!entry) {
      return {
        error: "This indexation does not have any entry with this ID",
      };
    }

    await prisma.entry.delete({
      include: {
        storySuggestions: true,
        storyKindSuggestions: true,
      },
      where: {
        id: entryId,
      },
    });

    await refreshIndexation(services);

    return { status: "OK" };
  },

  swapPageUrls: async (pageNumber1: number, pageNumber2: number) =>
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
          id: services._socket.data.indexation.id,
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
                    pageNumber: pageNumber1,
                  },
                  where: {
                    pageNumber: -pageNumber2,
                  },
                },
              ],
            },
          },
          where: {
            id: services._socket.data.indexation.id,
          },
        })
      )
      .then(async () => {
        await refreshIndexation(services);
        return {
          status: "OK" as const,
        };
      }),

  acceptIssueSuggestion: async (suggestionId: issueSuggestion["id"] | null) => {
    if (
      !services._socket.data.indexation.issueSuggestions.some(
        ({ id }) => id === suggestionId
      )
    ) {
      return {
        error: "This issue suggestion does not exist in this indexation",
      };
    }
    return prisma.indexation
      .update({
        data: {
          acceptedIssueSuggestion:
            suggestionId === null
              ? { disconnect: true }
              : {
                  connect: {
                    id: suggestionId,
                    indexationId: services._socket.data.indexation.id,
                  },
                },
        },
        where: {
          id: services._socket.data.indexation.id,
        },
      })
      .then(async () => {
        await refreshIndexation(services);
        return {
          status: "OK",
        };
      });
  },

  createStorySuggestion: async (
    suggestion: Prisma.storySuggestionUncheckedCreateInput & { ai: boolean }
  ) =>
    prisma.storySuggestion
      .create({
        data: suggestion,
      })
      .then(async (createdStorySuggestion) => {
        await refreshIndexation(services);
        return {
          createdStorySuggestion,
        };
      }),

  createIssueSuggestion: async (
    suggestion: Omit<Prisma.issueSuggestionUncheckedCreateInput, "indexationId">
  ) =>
    prisma.issueSuggestion
      .create({
        data: {
          ...suggestion,
          indexationId: services._socket.data.indexation.id,
        },
      })
      .then(async (createdIssueSuggestion) =>
        prisma.indexation
          .update({
            data: {
              acceptedIssueSuggestion: {
                connect: {
                  id: createdIssueSuggestion.id,
                  indexationId: services._socket.data.indexation.id,
                },
              },
            },
            where: {
              id: services._socket.data.indexation.id,
            },
          })
          .then(() =>
            prisma.issueSuggestion.deleteMany({
              where: {
                indexationId: services._socket.data.indexation.id,
                ai: null,
                id: {
                  not: createdIssueSuggestion.id, // Only one user-based issue suggestion
                },
              },
            })
          )
          .then(async () => {
            await refreshIndexation(services);
            return createdIssueSuggestion;
          })
      ),

  updateIndexation: async (
    indexation: Pick<indexation, "price" | "releaseDate"> & {
      numberOfPages: number;
    }
  ) => {
    const { numberOfPages, ...changes } = indexation;
    if (changes.releaseDate && !new Date(changes.releaseDate)) {
      return {
        error: `Invalid release date`,
        errorDetails: JSON.stringify({ releaseDate: changes.releaseDate }),
      };
    }
    if (numberOfPages < 4 || numberOfPages > 996 || numberOfPages % 2 !== 0) {
      return {
        error: `Invalid number of pages`,
        errorDetails: JSON.stringify({ numberOfPages }),
      };
    }
    const currentMaxPageNumber = Math.max(
      ...services._socket.data.indexation.pages.map(
        ({ pageNumber }) => pageNumber
      )
    );

    const pagesToCreate = Array.from({
      length: numberOfPages - currentMaxPageNumber,
    }).map((_, idx) => ({
      pageNumber: currentMaxPageNumber + idx + 1,
    }));

    await prisma.indexation.update({
      data: {
        pages: {
          deleteMany: {
            pageNumber: {
              gt: numberOfPages,
            },
          },
          createMany: {
            data: pagesToCreate,
          },
        },
      },
      where: {
        id: services._socket.data.indexation.id,
      },
    });
    return prisma.indexation
      .update({
        data: changes,
        where: {
          id: services._socket.data.indexation.id,
        },
      })
      .then(() => refreshIndexation(services))
      .then(() => ({
        status: "OK",
      }));
  },

  acceptStorySuggestion: async (
    entryId: entry["id"],
    storySuggestionId: storySuggestion["id"] | null
  ) => {
    const entry = services._socket.data.indexation.entries.find(
      ({ id, storySuggestions }) =>
        (entryId === id && storySuggestionId === null) ||
        storySuggestions.some(({ id }) => id === storySuggestionId)
    );
    if (!entry) {
      return {
        error: `This indexation does not have any entry with this suggestion`,
        errorDetails: JSON.stringify({ storySuggestionId }),
      };
    }

    await prisma.entry.update({
      data: {
        acceptedStorySuggestionId: storySuggestionId,
      },
      where: {
        id: entry.id,
      },
    });

    await refreshIndexation(services);
    return { status: "OK" };
  },

  acceptStoryKindSuggestion: async (
    entryId: entry["id"],
    storyKindSuggestionId: storyKindSuggestion["id"] | null
  ) => {
    const entry = services._socket.data.indexation.entries.find(
      ({ storyKindSuggestions }) =>
        storyKindSuggestions.some(({ id }) => id === storyKindSuggestionId)
    );
    if (!entry) {
      return {
        error: `This indexation does not have any entry with this story kind suggestion`,
        errorDetails: JSON.stringify({ storyKindSuggestionId }),
      };
    }
    if (entry.id !== entryId) {
      return {
        error: `This indexation does not have any entry with this ID`,
        errorDetails: JSON.stringify({ entryId }),
      };
    }

    await prisma.entry.update({
      data: {
        acceptedStoryKindSuggestionId: storyKindSuggestionId,
      },
      where: {
        id: entryId,
      },
    });

    await refreshIndexation(services);

    return { status: "OK" };
  },

  updateEntry: async (
    entryId: entry["id"],
    data: Pick<
      entry,
      | "entirepages"
      | "brokenpagenumerator"
      | "brokenpagedenominator"
      | "title"
      | "position"
    >
  ) => {
    const entry = services._socket.data.indexation.entries.find(
      ({ id }) => id === entryId
    );
    if (!entry) {
      return {
        error: `This indexation does not have any entry with this ID`,
        errorDetails: JSON.stringify({ entryId }),
      };
    }

    await prisma.entry.update({
      data,
      where: {
        id: entryId,
      },
    });

    await refreshIndexation(services);

    return { status: "OK" };
  },

  createEntry: async (position: number) =>
    createEntry(services._socket.data.indexation.id, position)
      .then(() => refreshIndexation(services))
      .then(() => ({ status: "OK" })),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  IndexationServerSentStartEndEvents
>(
  new RegExp(`^${namespaces.INDEXATION.replace("{id}", "[0-9]{8}T[0-9]{9}")}$`),
  {
    listenEvents,
    middlewares: [
      RequiredAuthMiddleware,
      async (services, next) => {
        const indexationId = services._socket.nsp.name.split("/").pop()!;
        if (!indexationId) {
          next(new Error("No indexation ID provided"));
          return;
        }

        await refreshIndexation(services, true, indexationId);
        next();
      },
    ],
  }
);

export type ClientEmitEvents = (typeof client)["emitEvents"];
export type ClientListenEvents = (typeof client)["listenEventsInterfaces"];

export const createEntry = async (indexationId: string, position: number) =>
  prisma.entry.create({
    include: {
      storyKindSuggestions: true,
    },
    data: {
      position,
      entirepages: 1,
      indexation: {
        connect: {
          id: indexationId,
        },
      },
      storyKindSuggestions: {
        createMany: {
          data: (await prisma.storyKindRows.findMany()).map(({ id }) => ({
            storyKindRowsStr: id,
          })),
        },
      },
    },
  });
