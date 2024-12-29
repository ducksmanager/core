import type { Server, Socket } from "socket.io";
import "~group-by";

import type { NamespaceWithData, SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import CoaServices from "~dm-services/coa/types";
import { STORY, storyKinds } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { Prisma } from "~prisma/client_dumili";
import { SocketClient } from "~socket.io-client-services";

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const { services: coaServices } = socket.addNamespace<CoaServices>(
  CoaServices.namespaceEndpoint,
);

import { RequiredAuthMiddleware } from "../_auth";
import { runKumikoOnPages } from "./kumiko";
import { runOcrOnImages } from "./ocr";
import type { FullIndexation, ServerSentEvents } from "./types";
import Events, { indexationPayloadInclude } from "./types";

type IndexationSocket = Socket<
  Events,
  ServerSentEvents,
  Record<string, never>,
  SessionDataWithIndexation
>;

let isAiRunning = false
const getFullIndexation = (socket: IndexationSocket, indexationId: string) =>
  prisma.indexation
    .findUnique({
      where: { id: indexationId },
      include: indexationPayloadInclude,
    })
    .then((indexation) => {
      if (indexation && !isAiRunning) {
        isAiRunning = true
        runKumikoOnPages(socket, indexation)
          .then(() =>
            runOcrOnImages(
              socket,
              indexation.pages
                .filter(({ image }) => !!image)
                .map(({ pageNumber, image }) => ({ pageNumber, image: image! })),
            ),
          )
          .then(() => setInferredEntriesStoryKinds(socket, indexation.entries))
          .then(() => createAiStorySuggestions(socket, indexation))
          .finally(() => {
            isAiRunning = false
          });
      }
      return indexation;
    });

const createAiStorySuggestions = async (
  socket: IndexationSocket,
  indexation: FullIndexation,
) => {
  for (const entry of indexation.entries) {
    if (entry?.acceptedStoryKind?.kind === STORY) {

      const firstPageOfEntry = getEntryPages(indexation, entry.id)[0];
      const ocrResults = firstPageOfEntry.image?.aiOcrResult?.matches;

      if (!ocrResults) {
        console.log(`Entry ${entry.id}: No OCR results found on the first page`);
        continue;
      }

      socket.emit("createAiStorySuggestions", entry.id);

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

      await prisma.storySuggestionAi.deleteMany({
        where: {
          storySuggestion: {
            entryId: entry.id
          }
        },
      });
      await prisma.storySuggestion.deleteMany({
        where: {
            entryId: entry.id
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
            )
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
      socket.emit("createAiStorySuggestionsEnd", entry.id);
    } else {
      console.log(`Entry ${entry.id}: This entry is not a story`);
    }
  }
};

const setInferredEntriesStoryKinds = async (
  socket: IndexationSocket,
  entries: FullIndexation["entries"],
  force?: boolean,
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

    const entryIdx = socket.data.indexation.entries.findIndex(
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

    socket.emit("setInferredEntryStoryKindEnd", entry.id);
  }
};

const getIndexationMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  const indexationId = socket.nsp.name.split("/").pop()!;
  if (!indexationId) {
    next(new Error("No indexation ID provided"));
    return;
  }
  socket.data.indexation = await getFullIndexation(
    socket as IndexationSocket,
    indexationId,
  );

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
            include: { image: { include: { aiKumikoResult: true } } },
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
        indexationSocket.emit('setKumikoInferredPageStoryKinds', 1)
        callback({ indexation: indexationSocket.data.indexation });
      });

      indexationSocket.on("deleteEntry", async (entryId, entryIdToExtend, callback) => {
        const { indexation } = indexationSocket.data;
        const entry = indexation.entries.find(
          ({ id }) => id === entryId,
        );
        if (!entry) {
          callback({ error: "This indexation does not have any entry with this ID" });
          return;
        }
        const entryIdx = indexation.entries.findIndex(
          ({ id }) => id === entryId,
        );
        const entryToExtend = indexation.entries[entryIdToExtend === "previous" ? entryIdx - 1 : entryIdx + 1];
        if (!entryToExtend) {
          if (entryIdToExtend === "previous") {
            callback({ error: "This entry does not have any previous entry" });
          }
          else {
            callback({ error: "This entry does not have any next entry" });
          }
          return;
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

        callback({status: 'OK'})
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
                  id: indexationSocket.data.indexation.id,
                },
              }),
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

      indexationSocket.on("updateIndexation", async (indexation, callback) => {
        const { numberOfPages } = indexation;
        if (
          numberOfPages < 4 ||
          numberOfPages > 996 ||
          numberOfPages % 2 !== 0
        ) {
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
              id: indexationSocket.data.indexation.id,
            },
          });
        }
        return prisma.indexation
          .update({
            data: indexation,
            where: {
              id: indexationSocket.data.indexation.id,
            },
          })
          .then(() => callback({ status: "OK" }));
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

          await prisma.entry.update({
            data: {
              acceptedStoryKindSuggestionId: storyKindSuggestionId,
            },
            where: {
              id: entryId,
            },
          });

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

        callback({ status: "OK" });
      });

      indexationSocket.on("createEntry", async (callback) =>
        createEntry(indexationSocket.data.indexation.id).then(() =>
          callback({ status: "OK" }),
        ),
      );
    });
};

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
