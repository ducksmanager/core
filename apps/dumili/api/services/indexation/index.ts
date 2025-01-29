import "~group-by";

import type { Socket } from "socket.io";
import { SocketClient } from "socket-call-client";
import type { NamespaceProxyTarget } from "socket-call-server";
import {
  type ServerSentStartEndEvents,
  useSocketEvents,
} from "socket-call-server";

import { type ClientEvents as CoaEvents } from "~dm-services/coa";
import dmNamespaces from "~dm-services/namespaces";
import { STORY, storyKinds } from "~dumili-types/storyKinds";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";
import type {
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
import { runOcrOnImages } from "./ocr";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const coaEvents = socket.addNamespace<CoaEvents>(dmNamespaces.COA);

const indexationPayloadInclude = {
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
            },
          },
          aiOcrResult: {
            include: {
              matches: true,
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
        },
      },
      acceptedStoryKind: { include: { ai: true } },
      storyKindSuggestions: { include: { ai: true } },
      storySuggestions: {
        include: {
          ai: true,
          ocrDetails: true,
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
  setKumikoInferredPageStoryKinds: (pageId: number) => void;
  setInferredEntryStoryKind: (entryId: number) => void;
  createAiStorySuggestions: (entryId: number) => void;
  runOcrOnImage: (imageId: number) => void;
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

let isAiRunning = false;
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
      if (indexation && runAi && !isAiRunning) {
        isAiRunning = true;
        runKumikoOnPages(services, indexation)
          .then(() =>
            runOcrOnImages(
              services,
              indexation.pages
                .filter(({ image, id }) => !!image && getEntryFromPage(indexation, id)?.acceptedStoryKind?.kind === STORY)
                .map(({ pageNumber, image }) => ({
                  pageNumber,
                  image: image!,
                })),
            ),
          )
          .then(() =>
            setInferredEntriesStoryKinds(services, indexation.entries),
          )
          .then(() => 
            createAiStorySuggestions(services, indexation)
          )
          .finally(() => {
            isAiRunning = false;
            refreshIndexation(services, false, indexationId);
          });
      }
      return indexation;
    });

export const refreshIndexation = async (
  services: IndexationServices,
  runAi: boolean = true,
  id = services._socket.data.indexation.id,
) => {
  services._socket.data.indexation = (await getFullIndexation(services, id, runAi))!;
  services.indexationUpdated(services._socket.data.indexation);
};

const createAiStorySuggestions = async (
  services: IndexationServices,
  indexation: FullIndexation,
) => {
  for (const entry of indexation.entries) {
    if (
      entry.acceptedStoryKind?.kind === STORY &&
      !entry.storySuggestions.length
    ) {
      const firstPageOfEntry = getEntryPages(indexation, entry.id)[0];
      const ocrResults = firstPageOfEntry.image?.aiOcrResult?.matches;

      if (!ocrResults) {
        console.log(
          `Entry ${entry.id}: No OCR results found on the first page`,
        );
        continue;
      }

      services.createAiStorySuggestions(entry.id);

      const { results: searchResults } = await coaEvents.searchStory(
        ocrResults.map(({ text }) => text),
        false,
      );

      const storyDetailsOutput = await coaEvents.getStoryDetails(
        searchResults.map(({ storycode }) => storycode),
      );

      if (!("stories" in storyDetailsOutput)) {
        return {
          error: `Error when calling getStoryDetails`,
        };
      }
      const storyDetails = storyDetailsOutput.stories;

      const storyversionDetailsOutput = await coaEvents.getStoryversionsDetails(
        searchResults.map(
          ({ storycode }) => storyDetails![storycode].originalstoryversioncode!,
        ),
      );

      if (!("storyversions" in storyversionDetailsOutput)) {
        return {
          error: `Error when calling getStoryversionsDetails`,
        };
      }

      const storyversionDetails = storyversionDetailsOutput.storyversions;

      const storyResults = searchResults.filter(
        ({ storycode }) =>
          storyversionDetails![
            storyDetails![storycode].originalstoryversioncode!
          ].kind === STORY,
      );

      const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;

      await prisma.storySuggestionAi.deleteMany({
        where: {
          storySuggestion: {
            entryId: entry.id,
          },
        },
      });
      const newEntry = await prisma.entry.update({
        include: {
          storySuggestions: true,
        },
        where: {
          id: entry.id,
        },
        data: {
          storySuggestions: {
            create: storyResults.map(
              ({
                storycode,
                score,
              }): Prisma.storySuggestionCreateWithoutEntryInput => ({
                storycode,
                ai: {
                  create: {},
                },
                ocrDetails: {
                  create: {
                    score,
                  },
                },
              }),
            ),
          },
        },
      });
      const acceptedStorySuggestionId = newEntry.storySuggestions.find(
        ({ storycode }) => storycode === currentlyAcceptedStorycode,
      )?.id;
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

      services.createAiStorySuggestionsEnd(entry.id);
    } else {
      console.log(`Entry ${entry.id}: This entry is not a story`);
    }
  }
};

const setInferredEntriesStoryKinds = async (
  services: IndexationServices,
  entries: FullIndexation["entries"],
  force?: boolean,
) => {
  for (const entry of entries) {
    if (entry.storyKindSuggestions.some(({ ai }) => ai) && !force) {
      console.log(`Entry ${entry.id} already has an inferred story kind`);
      continue;
    }

    services.setInferredEntryStoryKind(entry.id);
    const { indexation } = services._socket.data;
    const pagesInferredStoryKinds = await prisma.image.findMany({
      select: {
        aiKumikoResult: {
          select: {
            id: true,
            inferredStoryKind: true,
          },
        },
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
        `Entry ${entry.id}: No pages with inferred story kinds found`,
      );
      continue;
    }

    const mostInferredStoryKind = Object.entries(
      pagesInferredStoryKinds
        .map(({ aiKumikoResult }) => ({
          ...aiKumikoResult,
          kind: aiKumikoResult?.inferredStoryKind,
        }))
        .groupBy("kind", "id[]"),
    ).sort((a, b) => b[1].length - a[1].length)[0][0] as
      | keyof typeof storyKinds
      | undefined;

    const entryIdx = services._socket.data.indexation.entries.findIndex(
      ({ id }) => id === entry.id,
    );
    console.log(
      `Kumiko: entry #${entryIdx}: inferred story kind is ${mostInferredStoryKind}`,
    );

    await prisma.storyKindSuggestionAi.deleteMany({
      where: {
        suggestionId: {
          in: indexation.entries[entryIdx].storyKindSuggestions.map(
            ({ id }) => id,
          ),
        },
      },
    });

    if (mostInferredStoryKind) {
      await prisma.storyKindSuggestionAi.create({
        data: {
          suggestionId: indexation.entries[entryIdx].storyKindSuggestions.find(
            ({ kind }) => kind === mostInferredStoryKind,
          )!.id,
        },
      });
    }

    services.setInferredEntryStoryKindEnd(entry.id);
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

const listenEvents = (services: IndexationServices) => {
  const { _socket } = services;
  return {
    setPageUrl: async (id: number, url: string | null) => {
      if (
        !_socket.data.indexation.pages.some(({ id: pageId }) => pageId === id)
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
      const { id: indexationId } = _socket.data.indexation;
      await prisma.indexation.delete({
        where: {
          id: indexationId,
        },
      });
    },

    loadIndexation: async () => {
      services.setKumikoInferredPageStoryKinds(1);
      return { indexation: _socket.data.indexation };
    },

    deleteEntry: async (
      entryId: entry["id"],
      entryIdToExtend?: "previous" | "next",
    ) => {
      const { indexation } = _socket.data;
      const entry = indexation.entries.find(({ id }) => id === entryId);
      if (!entry) {
        return {
          error: "This indexation does not have any entry with this ID",
        };
      }
      const entryIdx = indexation.entries.findIndex(({ id }) => id === entryId);
      const isLastEntry = entryIdx === indexation.entries.length - 1;

      let entryToExtend: entry | undefined;
      if (!isLastEntry) {
      entryToExtend =
        indexation.entries[
          entryIdToExtend === "previous" ? entryIdx - 1 : entryIdx + 1
        ];
      if (!entryToExtend) {
        if (entryIdToExtend === "previous") {
          return { error: "This entry does not have any previous entry" };
        } else {
          return { error: "This entry does not have any next entry" };
        }
      }
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

      if (entryToExtend) {
      await prisma.entry.update({
        data: {
          entirepages: entryToExtend.entirepages + entry.entirepages,
        },
        where: {
          id: entryToExtend.id,
        },
      });
    }

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
            id: _socket.data.indexation.id,
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
              id: _socket.data.indexation.id,
            },
          }),
        )
        .then(async () => {
          await refreshIndexation(services);
          return {
            status: "OK" as const,
          };
        }),

    acceptIssueSuggestion: async (
      suggestionId: issueSuggestion["id"] | null,
    ) => {
      if (
        !_socket.data.indexation.issueSuggestions.some(
          ({ id }) => id === suggestionId,
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
                      indexationId: _socket.data.indexation.id,
                    },
                  },
          },
          where: {
            id: _socket.data.indexation.id,
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
      suggestion: Prisma.storySuggestionUncheckedCreateInput & { ai: boolean },
    ) =>
      prisma.storySuggestion
        .create({
          data: {
            ...suggestion,
            ai: suggestion.ai
              ? {
                  create: {},
                }
              : undefined,
          },
        })
        .then(async (createdStorySuggestion) => {
          await refreshIndexation(services);
          return {
            createdStorySuggestion,
          };
        }),

    createIssueSuggestion: async (
      suggestion: Omit<
        Prisma.issueSuggestionUncheckedCreateInput,
        "indexationId"
      >,
    ) =>
      prisma.issueSuggestion
        .create({
          data: {
            ...suggestion,
            indexationId: _socket.data.indexation.id,
          },
        })
        .then(async ({ id }) => {
          await refreshIndexation(services);
          return {
            suggestionId: id,
          };
        }),

    updateIndexation: async (
      indexation: Pick<indexation, "price"> & { numberOfPages: number },
    ) => {
      const { numberOfPages } = indexation;
      if (numberOfPages < 4 || numberOfPages > 996 || numberOfPages % 2 !== 0) {
        return {
          error: `Invalid number of pages`,
          errorDetails: JSON.stringify({ numberOfPages }),
        };
      }
      const currentMaxPageNumber = Math.max(
        ..._socket.data.indexation.pages.map(({ pageNumber }) => pageNumber),
      );

      const pagesToCreate = Array.from({
        length: numberOfPages - currentMaxPageNumber,
      }).map((_, idx) => ({
        pageNumber: currentMaxPageNumber + idx + 1,
      }));

      if (pagesToCreate.length) {
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
            id: _socket.data.indexation.id,
          },
        });
      }
      return prisma.indexation
        .update({
          data: indexation,
          where: {
            id: _socket.data.indexation.id,
          },
        })
        .then(async () => {
          await refreshIndexation(services);
          return {
            status: "OK",
          };
        });
    },

    acceptStorySuggestion: async (
      entryId: entry["id"],
      storySuggestionId: storySuggestion["id"] | null,
    ) => {
      const entry = _socket.data.indexation.entries.find(
        ({ id, storySuggestions }) =>
          (entryId === id && storySuggestionId === null) ||
          storySuggestions.some(({ id }) => id === storySuggestionId),
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
      storyKindSuggestionId: storyKindSuggestion["id"] | null,
    ) => {
      const entry = _socket.data.indexation.entries.find(
        ({ storyKindSuggestions }) =>
          storyKindSuggestions.some(({ id }) => id === storyKindSuggestionId),
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
      >,
    ) => {
      const entry = _socket.data.indexation.entries.find(
        ({ id }) => id === entryId,
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

    createEntry: async () =>
      createEntry(_socket.data.indexation.id).then(async () => {
        await refreshIndexation(services);
        return { status: "OK" };
      }),
  };
};

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
  },
);

export type ClientEmitEvents = (typeof client)["emitEvents"];
export type ClientListenEvents = (typeof client)["listenEventsInterfaces"];

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
