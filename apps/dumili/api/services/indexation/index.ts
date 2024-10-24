import axios from "axios";
import sharp from "sharp";
import type { Server, Socket } from "socket.io";

import type { NamespaceWithData, SessionDataWithIndexation } from "~/index";
import { prisma } from "~/index";
import CoaServices from "~dm-services/coa/types";
import { storyKinds } from "~dumili-types/storyKinds";
import type {
  entry,
  storyKind,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";
import { SocketClient } from "~socket.io-client-services";

import type { FullEntry } from "./types";

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
                  pageEntries: isFirstPage ? {
                    create: {
                      entry: {
                        create: {
                          position: "a",
                          indexationId
                        }
                      }
                    },
                  } : undefined,
                },
              },
            },
            where: {
              id: indexationId,
            },
          })
          .then(async () => {
            if (isFirstPage) {
              await createStoryKindSuggestions(indexationId, [{
                position: "a",
                kind: storyKinds.find(({ label }) => label === "Cover")!.code,
                entryPages: [{ pageId: (await prisma.page.findFirstOrThrow({
                  where: {
                    indexationId,
                    pageNumber,
                  },
                  select: {
                    id: true,
                  },
                 }))!.id }],
              }])
            }
          })
          .then(callback);
      });

      indexationSocket.on("loadIndexation", async (callback) => {
        callback({ indexation: indexationSocket.data.indexation });
      });

      indexationSocket.on(
        "acceptIssueSuggestion",
        async (suggestionId, callback) => {
          await prisma.indexation.update({
            data: {
              acceptedIssueSuggestion: {
                connect: {
                  id: suggestionId,
                  indexationId: indexationSocket.data.indexation.id,
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

      indexationSocket.on(
        "createStorySuggestion",
        async (suggestion, callback) => {
          const { id } = await prisma.storySuggestion.create({
            data: suggestion,
          });
          callback({ suggestionId: id });
        },
      );

      indexationSocket.on(
        "createIssueSuggestion",
        async (suggestion, callback) => {
          const { id } = await prisma.issueSuggestion.create({
            data: {
              ...suggestion,
              indexationId: indexationSocket.data.indexation.id,
            },
          });
          callback({ suggestionId: id });
        },
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
            const storyStoryKind = storyKinds.find(
              ({ label }) => label === "Story",
            )!;
            const indexationId = indexationSocket.data.indexation.id;
            const entriesToCreate: (Pick<entry, "position"> &
              Pick<storyKindSuggestion, "kind"> & {
                entryPages: {
                  pageId: number;
                  panels: (typeof panelsPerPage)[number];
                }[];
              })[] = [];
            panelsPerPage.forEach((panelsOfPage, idx) => {
              const pageNumber = idx + 1;
              const inferredKind = inferStoryKindFromAiResults(
                panelsOfPage,
                pageNumber,
              );

              const page = {
                pageId: indexationSocket.data.indexation.pages[idx].id,
                panels: panelsOfPage,
              };

              // Don't create a new entry if both the previous one and this one are stories
              if (
                !(
                  storyStoryKind.code === inferredKind &&
                  storyStoryKind.code ===
                    entriesToCreate[entriesToCreate.length - 1]?.kind
                )
              ) {
                const position = String.fromCharCode(
                  (
                    [...entriesToCreate].pop()?.position ||
                    String.fromCharCode("a".charCodeAt(0) - 1)
                  ).charCodeAt(0) + 1,
                );
                entriesToCreate.push({
                  position,
                  kind: inferredKind,
                  entryPages: [page],
                });
              } else {
                entriesToCreate[entriesToCreate.length - 1].entryPages.push(
                  page,
                );
              }
            });

            await prisma.$transaction(
              entriesToCreate.map(({ entryPages }, idx) =>
                prisma.page.update({
                  where: {
                    id: entryPages[idx].pageId,
                  },
                  include: {
                    aiKumikoResultPanels: true,
                  },
                  data: {
                    aiKumikoResultPanels: {
                      createMany: {
                        data: entryPages[idx].panels,
                      },
                    },
                  },
                }),
              ),
            );

            await prisma.entryPage.deleteMany({
              where: {
                entry: {
                  indexationId,
                },
              },
            });
            await prisma.storyKindSuggestion.deleteMany({
              where: {
                entry: {
                  indexationId,
                },
              },
            });
            await prisma.storySuggestion.deleteMany({
              where: {
                entry: {
                  indexationId,
                },
              },
            });
            await prisma.entry.deleteMany({
              where: {
                indexationId,
              },
            });

            await upsertEntries(entriesToCreate, indexationId);

            await createStoryKindSuggestions(indexationId, entriesToCreate);

            await prisma.$transaction(
              entriesToCreate.map(
                ({ position, kind }) => prisma.$queryRaw`
            UPDATE entry
            SET accepted_story_kind_suggested_id = (SELECT id FROM story_kind_suggestion WHERE entry_id = (SELECT id FROM entry WHERE indexation_id = ${indexationId} AND position = ${position}) AND kind = ${kind})`,
              ),
            );

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

      indexationSocket.on("upsertEntries", async (entries, callback) => {
        const maxEntryId =
          (
            await prisma.entry.findFirst({
              select: {
                id: true,
              },
              orderBy: {
                id: "desc",
              },
            })
          )?.id || -1;
        const newAndUpdatedEntries = await upsertEntries(
          entries.map(({ id, pageIds }, idx) => ({
            id,
            entryPages: pageIds.map((pageId) => ({ pageId })),
            position: String.fromCharCode("a".charCodeAt(0) + idx),
          })),
          indexationSocket.data.indexation.id,
        );

        const newEntries = await prisma.entry.findMany({
          include: {
            entryPages: {
              include: {
                page: {
                  include: {
                    aiKumikoResultPanels: true,
                  },
                },
              },
            },
          },
          where: {
            id: {
              in: newAndUpdatedEntries
                .map(({ id }) => id)
                .filter((id) => id > maxEntryId),
            },
          },
        });

        await createStoryKindSuggestions(
          indexationSocket.data.indexation.id,
          newEntries.map(({ position, entryPages }) => ({
            entryPages,
            position,
            kind: inferStoryKindFromAiResults(
              entryPages[0].page.aiKumikoResultPanels,
              entryPages[0].page.pageNumber,
            ),
          })),
        );

        callback();
      });
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

const acceptStorySuggestion = async (suggestionId: storySuggestion['id']|undefined, entryId: entry['id']) =>
  prisma.entry.update({
    data: {
      acceptedSuggestedStoryKind: {
        connect: {
          id: suggestionId,
        },
      },
    },
    where: {
      id: entryId,
    }})

const acceptStoryKindSuggestion = (
  suggestionId: storyKindSuggestion['id']|undefined,
  entryId: entry['id'],
) =>
  prisma.entry.update({
    data: {
      acceptedSuggestedStoryKind: {
        connect: {
            id: suggestionId,
        },
      },
    },
    where: {
      id: entryId,
    },
  });

const createStoryKindSuggestions = (
  indexationId: string,
  entries: {
    entryPages: { pageId: number }[];
    position: string;
    kind: storyKind;
  }[],
) =>
  Promise.all([
    prisma.$transaction(
      entries
        .map(({ position, kind, entryPages }) => [
          { position, kind, aiSourcePageId: entryPages[0].pageId },
          ...storyKinds
            .filter(({ code }) => code !== kind)
            .map(({ code }) => ({
              position,
              kind: code,
              aiSourcePageId: null,
            })),
        ])
        .flat()
        .map(
          ({ position, kind, aiSourcePageId }) =>
            prisma.$queryRaw`
  INSERT INTO story_kind_suggestion (kind, ai_source_page_id, entry_id)
  VALUES (${kind}, ${aiSourcePageId}, (SELECT id FROM entry WHERE indexation_id = ${indexationId} AND position = ${position}))`,
        ),
    ),

    prisma.$transaction(
      entries.map(
        ({ position, kind }) =>
          prisma.$queryRaw`
      UPDATE entry
      SET accepted_story_kind_suggested_id = (SELECT id FROM story_kind_suggestion WHERE entry_id = (SELECT id FROM entry WHERE indexation_id = ${indexationId} AND position = ${position}) AND kind = ${kind})`,
      ),
    ),
  ]);

const upsertEntries = async (
  entries: (Pick<FullEntry, "position"> & {
    id?: number;
    entryPages: { pageId: number }[];
  })[],
  indexationId: string,
) =>
  await Promise.all(
    entries.map(({ id, position, entryPages }) =>
      prisma.entry.upsert({
        where: {
          id: id || -1,
        },
        update: {
          position,
          entryPages: {
            connectOrCreate: entryPages.map(({ pageId }) => ({
              where: { pageId_entryId: { pageId, entryId: id || -1 } },
              create: { pageId },
            })),
            deleteMany: {
              pageId: {
                notIn: entryPages.map(({ pageId }) => pageId),
              },
            },
          },
        },
        create: {
          indexationId,
          position,
          entryPages: {
            createMany: {
              data: entryPages.map(({ pageId }) => ({ pageId })),
            },
          },
        },
      }),
    ),
  );
