import "~group-by";

import type { SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import {
  endpoint as coaEndpoint,
  type ClientEvents as CoaEvents,
} from "~dm-services/coa";
import { STORY, storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import type {
  entry,
  indexation,
  issueSuggestion,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";
import { SocketClient } from "~socket.io-client-services";
import { runKumikoOnPages } from "./kumiko";
import { runOcrOnImages } from "./ocr";
import {
  type ServerSentStartEndEvents,
  useSocketServices,
} from "~socket.io-services";
import { RequiredAuthMiddleware } from "../_auth";
import { Socket } from "socket.io";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const { services: coaServices } = socket.addNamespace<CoaEvents>(coaEndpoint);

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
  ServerSentStartEndEvents<IndexationServerSentStartEvents>;

export type IndexationSocket = Socket<
  object,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>;

let isAiRunning = false;
const getFullIndexation = (socket: IndexationSocket, indexationId: string) =>
  prisma.indexation
    .findUnique({
      where: { id: indexationId },
      include: indexationPayloadInclude,
    })
    .then((indexation) => {
      if (indexation && !isAiRunning) {
        isAiRunning = true;
        runKumikoOnPages(socket, indexation)
          .then(() =>
            runOcrOnImages(
              socket,
              indexation.pages
                .filter(({ image }) => !!image)
                .map(({ pageNumber, image }) => ({ pageNumber, image: image! }))
            )
          )
          .then(() => setInferredEntriesStoryKinds(socket, indexation.entries))
          .then(() => createAiStorySuggestions(socket, indexation))
          .finally(() => {
            isAiRunning = false;
          });
      }
      return indexation;
    });

const createAiStorySuggestions = async (
  socket: IndexationSocket,
  indexation: FullIndexation
) => {
  for (const entry of indexation.entries) {
    if (entry?.acceptedStoryKind?.kind === STORY) {
      const firstPageOfEntry = getEntryPages(indexation, entry.id)[0];
      const ocrResults = firstPageOfEntry.image?.aiOcrResult?.matches;

      if (!ocrResults) {
        console.log(
          `Entry ${entry.id}: No OCR results found on the first page`
        );
        continue;
      }

      socket.emit("createAiStorySuggestions", entry.id);

      const { results: searchResults } = await coaServices.searchStory(
        ocrResults.map(({ text }) => text),
        false
      );

      const storyDetailsOutput = await coaServices.getStoryDetails(
        searchResults.map(({ storycode }) => storycode)
      );

      if (!("stories" in storyDetailsOutput)) {
        return {
          error: `Error when calling getStoryDetails`,
        };
      }
      const storyDetails = storyDetailsOutput.stories;

      const storyversionDetailsOutput =
        await coaServices.getStoryversionsDetails(
          searchResults.map(
            ({ storycode }) =>
              storyDetails![storycode].originalstoryversioncode!
          )
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
          ].kind === STORY
      );

      const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;

      await prisma.storySuggestionAi.deleteMany({
        where: {
          storySuggestion: {
            entryId: entry.id,
          },
        },
      });
      await prisma.storySuggestion.deleteMany({
        where: {
          entryId: entry.id,
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
              })
            ),
          },
        },
      });
      const acceptedStorySuggestionId = newEntry.storySuggestions.find(
        ({ storycode }) => storycode === currentlyAcceptedStorycode
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
      socket.emit("createAiStorySuggestionsEnd", entry.id);
    } else {
      console.log(`Entry ${entry.id}: This entry is not a story`);
    }
  }
};

const setInferredEntriesStoryKinds = async (
  socket: IndexationSocket,
  entries: FullIndexation["entries"],
  force?: boolean
) => {
  for (const entry of entries) {
    if (entry.storyKindSuggestions.some(({ ai }) => ai) && !force) {
      console.log(`Entry ${entry.id} already has an inferred story kind`);
      continue;
    }

    socket.emit("setInferredEntryStoryKind", entry.id);
    const { indexation } = socket.data;
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
        `Entry ${entry.id}: No pages with inferred story kinds found`
      );
      continue;
    }

    const mostInferredStoryKind = Object.entries(
      pagesInferredStoryKinds
        .map(({ aiKumikoResult }) => ({
          ...aiKumikoResult,
          kind: aiKumikoResult?.inferredStoryKind,
        }))
        .groupBy("kind", "id[]")
    ).sort((a, b) => b[1].length - a[1].length)[0][0] as
      | keyof typeof storyKinds
      | undefined;

    const entryIdx = socket.data.indexation.entries.findIndex(
      ({ id }) => id === entry.id
    );
    console.log(
      `Kumiko: entry #${entryIdx}: inferred story kind is ${mostInferredStoryKind}`
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
      await prisma.storyKindSuggestionAi.create({
        data: {
          suggestionId: indexation.entries[entryIdx].storyKindSuggestions.find(
            ({ kind }) => kind === mostInferredStoryKind
          )!.id,
        },
      });
    }

    socket.emit("setInferredEntryStoryKindEnd", entry.id);
  }
};

export type IndexationsSocket = Socket<
  object,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>;

const listenEvents = (socket: IndexationsSocket) => ({
  setPageUrl: async (id: number, url: string | null) => {
    if (!socket.data.indexation.pages.some(({ id: pageId }) => pageId === id)) {
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
      .then(() => "OK" as const);
  },

  deleteIndexation: async () => {
    const { id: indexationId } = socket.data.indexation;
    await prisma.indexation.delete({
      where: {
        id: indexationId,
      },
    });
  },

  loadIndexation: async () => {
    socket.emit("setKumikoInferredPageStoryKinds", 1);
    return { indexation: socket.data.indexation };
  },

  deleteEntry: async (
    entryId: entry["id"],
    entryIdToExtend: "previous" | "next"
  ) => {
    const { indexation } = socket.data;
    const entry = indexation.entries.find(({ id }) => id === entryId);
    if (!entry) {
      return {
        error: "This indexation does not have any entry with this ID",
      };
    }
    const entryIdx = indexation.entries.findIndex(({ id }) => id === entryId);
    const entryToExtend =
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

    await prisma.entry.delete({
      include: {
        storySuggestions: true,
        storyKindSuggestions: true,
      },
      where: {
        id: entryId,
      },
    });

    await prisma.entry.update({
      data: {
        entirepages: entryToExtend.entirepages + entry.entirepages,
      },
      where: {
        id: entryToExtend.id,
      },
    });

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
          id: socket.data.indexation.id,
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
            id: socket.data.indexation.id,
          },
        })
      )
      .then(() => ({ status: "OK" as const })),

  acceptIssueSuggestion: async (suggestionId: issueSuggestion["id"] | null) => {
    if (
      !socket.data.indexation.issueSuggestions.some(
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
                    indexationId: socket.data.indexation.id,
                  },
                },
        },
        where: {
          id: socket.data.indexation.id,
        },
      })
      .then(() => ({ status: "OK" }));
  },

  createStorySuggestion: async (
    suggestion: Prisma.storySuggestionUncheckedCreateInput & { ai: boolean }
  ) =>
    prisma.storySuggestion
      .create({ data: suggestion })
      .then((createdStorySuggestion) => ({ createdStorySuggestion })),

  createIssueSuggestion: async (
    suggestion: Omit<
      Prisma.issueSuggestionUncheckedCreateInput,
      "indexationId"
    > & { ai: boolean }
  ) =>
    prisma.issueSuggestion
      .create({
        data: {
          ...suggestion,
          indexationId: socket.data.indexation.id,
        },
      })
      .then(({ id }) => ({ suggestionId: id })),

  updateIndexation: async (
    indexation: Pick<indexation, "price"> & { numberOfPages: number }
  ) => {
    const { numberOfPages } = indexation;
    if (numberOfPages < 4 || numberOfPages > 996 || numberOfPages % 2 !== 0) {
      return {
        error: `Invalid number of pages`,
        errorDetails: JSON.stringify({ numberOfPages }),
      };
    }
    const currentMaxPageNumber = Math.max(
      ...socket.data.indexation.pages.map(({ pageNumber }) => pageNumber)
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
          id: socket.data.indexation.id,
        },
      });
    }
    return prisma.indexation
      .update({
        data: indexation,
        where: {
          id: socket.data.indexation.id,
        },
      })
      .then(() => ({ status: "OK" }));
  },

  acceptStorySuggestion: async (
    entryId: entry["id"],
    storySuggestionId: storySuggestion["id"] | null
  ) => {
    const entry = socket.data.indexation.entries.find(
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
    return { status: "OK" };
  },

  acceptStoryKindSuggestion: async (
    entryId: entry["id"],
    storyKindSuggestionId: storyKindSuggestion["id"] | null
  ) => {
    const entry = socket.data.indexation.entries.find(
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

    return { status: "OK" };
  },

  updateEntry: async (
    entryId: entry["id"],
    data: Pick<
      entry,
      "entirepages" | "brokenpagenumerator" | "brokenpagedenominator" | "title"
    >
  ) => {
    const entry = socket.data.indexation.entries.find(
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

    return { status: "OK" };
  },

  createEntry: async () =>
    createEntry(socket.data.indexation.id).then(() => ({ status: "OK" })),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>(
  "!",
  // new RegExp(`^${namespaceEndpoint.replace("{id}", "[0-9]{8}T[0-9]{9}")}$`)
  {
    listenEvents,

    middlewares: [
      RequiredAuthMiddleware,
      async (socket, next) => {
        const indexationId = socket.nsp.name.split("/").pop()!;
        if (!indexationId) {
          next(new Error("No indexation ID provided"));
          return;
        }
        socket.data.indexation = (await getFullIndexation(
          socket,
          indexationId
        ))!;

        next();
      },
    ],
  }
);

export type ClientEmitEvents = typeof client['emitEvents']
export type ClientListenEvents = typeof client['listenEventsInterfaces']

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
            })
          ),
        },
      },
    },
  });
