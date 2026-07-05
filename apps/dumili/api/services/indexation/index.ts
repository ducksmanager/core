import "~group-by";

import { v2 as cloudinary } from "cloudinary";
import type { Server, Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import {
  type ServerSentStartEndEvents,
  useSocketEvents,
} from "socket-call-server";

import { COVER, STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import prisma from "~prisma/client";
import type {
  aiKumikoResult,
  entry,
  indexation,
  issueSuggestion,
  page,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili/client";
import type { ClientEvents as CoaEvents } from "~dm-services/coa";
import dmNamespaces from "~dm-services/namespaces";

import type { SessionDataWithIndexation } from "../../index";
import { RequiredAuthMiddleware } from "../_auth";
import namespaces from "../namespaces";
import { runKumikoOnPages } from "./kumiko";
import { runOcrOnImage } from "./ocr";
import {
  getStoriesFromImage,
  getFullStoriesFromKeywords,
} from "./story-search";
import { SocketClient } from "socket-call-client";

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { definePDFJSModule, getDocumentProxy, renderPageAsImage } from 'unpdf'

import { createExtractorFromData } from "node-unrar-js";
import { unzipSync } from "fflate";

await definePDFJSModule(() => import('pdfjs-dist'))

// In the production bundle, bun bakes in the CI build path for unrar.wasm.
// We override it by loading the file explicitly when it's present next to the bundle.
// In local dev (unbundled), node-unrar-js resolves the path itself so we leave it undefined.
const bundleSideWasm = join(dirname(fileURLToPath(import.meta.url)), "unrar.wasm");
const unrarWasmBinary = existsSync(bundleSideWasm)
  ? (() => { const buf = readFileSync(bundleSideWasm); return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); })()
  : undefined;

const canvasImport = () => import('@napi-rs/canvas');

const socket = new SocketClient(process.env.DM_SOCKET_URL!);
const coaEvents = socket.addNamespace<CoaEvents>(dmNamespaces.COA);

const MAX_DOCUMENT_FILE_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = new Set<string>([
  "application/pdf",
  "application/x-rar",
  "application/octet-stream",
  "application/zip",
]);
const ALLOWED_IMAGE_MIME_TYPES = new Set<string>([
  "image/png",
  "image/jpeg",
  "image/jpg",
]);
const ALLOWED_MIME_TYPES = new Set<string>([...ALLOWED_DOCUMENT_MIME_TYPES, ...ALLOWED_IMAGE_MIME_TYPES]);

const inferMimeType = (value?: string) => {
  const extension = value?.toLowerCase()?.split('.')?.pop();
  if (!extension) {
    return undefined;
  }

  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "rar": case "cbr":
      return "application/x-rar";
    case "zip": case "cbz":
      return "application/zip";
    case "png":
      return "image/png";
    case "jpg": case "jpeg":
      return "image/jpeg";
  }
  return undefined;
};

const uploadToCloudinary = async ({ services, folder, context, page, ...params }: {
  services: IndexationServices;
  folder: string;
  context: Record<string, string>;
  page: page;
  buffer: Buffer
}) => new Promise<void>(
  (resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        context,
        overwrite: false,
        folder,
        resource_type: "image",
        upload_preset: "dumili_signed",
      },
      async (error, result) => {
        if (error || !result) {
          reject(
            error ??
            new Error(
              "Cloudinary upload failed: " + JSON.stringify(result),
            ),
          );
        }
        else {
          console.log(`Uploaded page ${page.pageNumber} to Cloudinary:`, result.secure_url);

          await setPageUrl(
            services,
            page.id,
            result.secure_url,
          );
          resolve();
        }
      },
    );
    stream.end(params.buffer);
  },
);

const entryInclude = {
  acceptedStory: true,
  acceptedStoryKind: { include: { storyKindRows: true } },
  storyKindSuggestions: { include: { storyKindRows: true } },
  storySuggestions: {
    include: {
      aiStorySuggestion: {
        include: {
          aiStorySearchPossibleStory: true
        }
      }
    }
  },
  includedInEntry: true,
} as const;

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
                  aiStorySuggestion: true,
                },
              },
            },
          },
          aiStorySearchResult: {
            include: {
              stories: {
                include: {
                  aiStorySuggestion: true,
                },
              },
            },
          },
        },
      },
    },
  },
  acceptedIssueSuggestion: true,
  issueSuggestions: true,
  entries: {
    include: {
      ...entryInclude,
      includedEntries: {
        include: entryInclude,
      },
    },
  },
} as const;

const setPageUrl = async (services: IndexationServices, id: number, url: string | null) => {
  if (
    !services._socket.data.indexation.pages.some(
      ({ id: pageId }) => pageId === id,
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
};

type EntryWithoutIncludedEntries = Prisma.entryGetPayload<{
  include: typeof entryInclude;
}>;

export type FullEntry = EntryWithoutIncludedEntries & {
  includedEntries?: EntryWithoutIncludedEntries[];
};

export type FullIndexation = Omit<
  Prisma.indexationGetPayload<{
    include: typeof indexationPayloadInclude;
  }>,
  "entries"
> & {
  entries: FullEntry[];
};

export type IndexationServerSentStartEvents = {
  reportSetKumikoInferredPageStoryKinds: (pageId: number) => void;
  reportSetInferredEntryStoryKind: (entryId: number) => void;
  reportCreateAiStorySuggestions: (entryId: number) => void;
  reportRunOcrOnImage: (imageId: number) => void;
  reportRunStorySearchOnImage: (imageId: number) => void;
  reportDocumentAnalyzed: (pageNumbers: number[]) => void;
  reportDocumentPageUploaded: (pageNumber: number) => void;
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
  runAi = true,
) =>
  prisma.indexation
    .findUnique({
      where: { id: indexationId, dmUserId: services._socket.data.user.id },
      include: indexationPayloadInclude,
    })
    .then((indexation) => {
      if (indexation) {
        indexation.entries = indexation.entries.sort(
          (a, b) => a.position - b.position,
        );
        if (runAi && !(indexationId in isAiRunning)) {
          isAiRunning[indexationId] = true;
          runKumikoOnPages(services, indexation)
            .then(() =>
              setInferredEntriesStoryKinds(services, indexation.entries),
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
  runAi = true,
  id = services._socket.data.indexation.id,
) => {
  services._socket.data.indexation = (await getFullIndexation(
    services,
    id,
    runAi,
  ))!;
  services.indexationUpdated(services._socket.data.indexation);
};

const createAiStorySuggestions = async (
  services: IndexationServices,
  indexation: FullIndexation,
) => {
  const languagecode = indexation.acceptedIssueSuggestion?.publicationcode
    ? (await coaEvents.getPublicationLanguagecode(
      indexation.acceptedIssueSuggestion.publicationcode,
    )) || "en"
    : "en";

  for (const entry of indexation.entries) {
    if (
      [STORY, COVER].includes(
        entry.acceptedStoryKind?.storyKindRows?.kind ?? "",
      )
    ) {
      const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;

      const firstPageOfEntry = getEntryPages(indexation, entry.id)[0];

      if (!firstPageOfEntry.image) {
        continue;
      }

      services.reportCreateAiStorySuggestions(entry.id);

      for (const { name, field, storyField, _storySuggestionRelationship } of [
        {
          name: "image-based story search",
          field: "aiStorySearchResult",
          storyField: "aiStorySearchPossibleStory",
          _storySuggestionRelationship: "storySearchDetails",
        },
        {
          name: "OCR-based story search",
          field: "aiOcrResult",
          storyField: "aiOcrPossibleStory",
          _storySuggestionRelationship: "ocrDetails",
        },
      ] as const) {
        const cachedResults:
          | {
            type: typeof _storySuggestionRelationship;
            storycode: string;
          }[]
          | undefined = undefined; /*firstPageOfEntry.image[field]?.stories
      .filter(
        (
          story
        ): story is typeof story & {
          aiStorySuggestion: { storycode: string };
        } => !!story.aiStorySuggestion
      )
      .map(
        ({
          aiStorySuggestion: {
            storySuggestion: { storycode },
          },
        }) => ({
          type: storySuggestionRelationship,
          storycode,
        })
      );*/

        if (cachedResults) {
          // if (cachedResults.length) {
          //   console.log(
          //     `Entry starting at page ${entry.position}: ${cachedResults.length} ${name} matches found (cached)`,
          //   );
          //   break;
          // } else {
          //   console.log(
          //     `Entry starting at page ${entry.position}: No ${name} matches found (cached)`,
          //   );
          //   continue;
          // }
        } else {
          const results =
            field === "aiStorySearchResult"
              ? await getStoriesFromImage(
                firstPageOfEntry.image,
                entry.acceptedStoryKind?.storyKindRows?.kind === COVER,
              )
              : await getFullStoriesFromKeywords(
                (
                  await runOcrOnImage(
                    services,
                    entry.position,
                    firstPageOfEntry.image,
                    languagecode,
                  )
                ).map(({ text }) => text),
              );
          if ("error" in results) {
            console.error(results.error);
          } else {
            let aiResultId = (
              await prisma.image.findUnique({
                where: {
                  id: firstPageOfEntry.image.id,
                },
              })
            )?.[`${field}Id`];

            if (aiResultId) {
              if (field === "aiOcrResult") {
                await prisma.storySuggestion.deleteMany({
                  where: {
                    aiStorySuggestion: {
                      aiOcrPossibleStory: {
                        resultId: aiResultId,
                      },
                    },
                  },
                });
                await prisma.aiOcrPossibleStory.deleteMany({
                  where: {
                    resultId: aiResultId,
                  },
                });
              } else {
                await prisma.storySuggestion.deleteMany({
                  where: {
                    aiStorySuggestion: {
                      aiStorySearchPossibleStory: {
                        resultId: aiResultId,
                      },
                    },
                  },
                });
                await prisma.aiStorySearchPossibleStory.deleteMany({
                  where: {
                    resultId: aiResultId,
                  },
                });
              }
            } else {
              if (field === "aiOcrResult") {
                aiResultId = (
                  await prisma.aiOcrResult.create({
                    data: {},
                  })
                ).id;
              } else {
                aiResultId = (
                  await prisma.aiStorySearchResult.create({
                    data: {},
                  })
                ).id;
              }
            }

            await prisma.image.update({
              where: {
                id: firstPageOfEntry.image.id,
              },
              data: {
                [`${field}Id`]: aiResultId,
              },
            });
            if (!results.stories.length) {
              console.info(
                `Entry starting at page ${entry.position}: No ${name} results found`,
              );
            } else {
              console.log(
                `Entry starting at page ${entry.position}: ${results.stories.length} ${name} matches found`,
              );
              await prisma.storySuggestion.deleteMany({
                where: {
                  aiStorySuggestion: {
                    [storyField]: {
                      // aiOcrPossibleStory or aiStorySearchPossibleStory
                      isNot: null,
                    },
                  },
                  entryId: entry.id,
                },
              });

              const storiesWithScores = results.stories.groupBy(
                "storycode",
                "score[]",
              );

              for (const storycode of Object.keys(storiesWithScores)) {
                console.log(
                  "Creating story suggestion for storycode",
                  storycode,
                );
                const data = {
                  aiStorySuggestion: {
                    create: {
                      [storyField]: {
                        // aiOcrPossibleStory or aiStorySearchPossibleStory
                        create: {
                          [field]: {
                            // aiOcrResult or aiStorySearchResult
                            connect: {
                              id: aiResultId,
                            },
                          },
                          score: storiesWithScores[storycode].sort(
                            (a, b) => b - a,
                          )[0],
                        },
                      },
                    },
                  },
                  storycode,
                  entry: {
                    connect: {
                      id: entry.id,
                    },
                  },
                };
                await prisma.storySuggestion.upsert({
                  where: {
                    entryId_storycode: {
                      entryId: entry.id,
                      storycode,
                    },
                  },
                  create: data,
                  update: data,
                });
              }

              const newEntry = (await prisma.entry.findUnique({
                include: {
                  storySuggestions: {
                    include: {
                      aiStorySuggestion: {
                        include: {
                          [storyField]: true, // ocrDetails or storySearchDetails
                        },
                      },
                    },
                  },
                },
                where: {
                  id: entry.id,
                },
              }))!;
              const acceptedStorySuggestionId = newEntry.storySuggestions.find(
                ({ storycode }) => storycode === currentlyAcceptedStorycode,
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
      console.log(
        `Entry starting at page ${entry.position}: This entry is not a story or a cover`,
      );
    }
  }
};

const setInferredEntriesStoryKinds = async (
  services: IndexationServices,
  entries: FullIndexation["entries"],
  force?: boolean,
) => {
  for (const entry of entries) {
    if (
      entry.storyKindSuggestions.some(
        ({ aiKumikoResultId }) => aiKumikoResultId,
      ) &&
      !force
    ) {
      console.log(
        `Entry starting at page ${entry.position}: already has an inferred story kind`,
      );
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
        `Entry starting at page ${entry.position}: No pages with inferred story kinds found`,
      );
    } else {
      const mostInferredStoryKind = Object.entries(
        (
          pagesInferredStoryKinds.filter(
            ({ aiKumikoResult }) => aiKumikoResult !== null,
          ) as { aiKumikoResult: aiKumikoResult }[]
        )
          .map(({ aiKumikoResult: { id, inferredStoryKindRowsStr } }) => ({
            id,
            inferredStoryKindRowsStr,
          }))
          .groupBy("inferredStoryKindRowsStr", "id[]"),
      ).sort((a, b) => b[1].length - a[1].length)[0][0];

      const entryIdx = services._socket.data.indexation.entries.findIndex(
        ({ id }) => id === entry.id,
      );
      console.log(
        `Kumiko: entry #${entryIdx}: inferred story kind and number of rows are ${mostInferredStoryKind}`,
      );

      if (mostInferredStoryKind) {
        const suggestion = indexation.entries[
          entryIdx
        ].storyKindSuggestions.find(
          ({ storyKindRowsStr }) => storyKindRowsStr === mostInferredStoryKind,
        );
        if (suggestion) {
          await prisma.entry.update({
            data: {
              storyKindSuggestions: {
                update: {
                  data: {
                    aiKumikoResultId: pagesInferredStoryKinds.find(
                      ({ aiKumikoResult }) =>
                        aiKumikoResult?.inferredStoryKindRowsStr ===
                        mostInferredStoryKind,
                    )?.aiKumikoResultId,
                  },
                  where: {
                    id: suggestion.id,
                  },
                },
              },
            },
            where: {
              id: entry.id,
            },
          });
          if (!entry.acceptedStoryKindSuggestionId) {
            await prisma.entry.update({
              data: {
                acceptedStoryKindSuggestionId: suggestion.id,
              },
              where: {
                id: entry.id,
              },
            });
          }
        } else {
          console.warn(
            `Entry starting at page ${entry.position}: no inferred story kind and number of rows found`,
          );
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

const makeServicesProxy = (io: Server, indexationId: string, user: SessionDataWithIndexation["user"], initialIndexation: FullIndexation): IndexationServices => {
  const data = { user, indexation: initialIndexation } as const;
  const ns = `/indexation/${indexationId}`;
  const socket = {
    data,
    nsp: { name: ns },
    emit: (event: string, ...args: unknown[]) => io.of(ns).emit(event, ...args),
  };
  return new Proxy({} as IndexationServices, {
    get(_, prop: string) {
      if (prop === '_socket') return socket;
      return (...args: unknown[]) => socket.emit(prop, ...args);
    }
  });
};

const uploadPages = async (services: IndexationServices, {
  buffer, fileName, mimeType, firstPageNumber, firstOutOfRangePageNumber,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  firstPageNumber: number;
  firstOutOfRangePageNumber: number;
}) => {
  try {
    const { indexation, user } = services._socket.data;
    const effectiveMimeType = mimeType || inferMimeType(fileName);
    if (!effectiveMimeType || !ALLOWED_MIME_TYPES.has(effectiveMimeType)) {
      return { error: "Unsupported file type" };
    }

    const isDocument = ALLOWED_DOCUMENT_MIME_TYPES.has(effectiveMimeType);
    const maxSize = isDocument ? MAX_DOCUMENT_FILE_SIZE : MAX_IMAGE_FILE_SIZE;

    if (buffer.byteLength > maxSize) {
      throw new Error(
        isDocument
          ? "Document file too large (max 50 MB)"
          : "Image file too large (max 5 MB)",
      );
    }

    const folder = `dumili/${user.username}/${indexation.id}`;
    const context = { indexation: indexation.id, user: user.username };

    if (isDocument) {
      const pagesToPotentiallyOverwrite = indexation.pages.filter(({ pageNumber }) =>
        pageNumber >= firstPageNumber && pageNumber < firstOutOfRangePageNumber
      );

      const uploadDocumentPages = async (items: { name: string; getData: () => Promise<Buffer> }[]) => {
        if (!items.length) {
          throw new Error("No valid pages found in the document");
        }
        const pagesToOverwrite = pagesToPotentiallyOverwrite.slice(0, items.length);
        services.reportDocumentAnalyzed(pagesToOverwrite.map(({ pageNumber }) => pageNumber));
        for (const [idx, page] of pagesToOverwrite.entries()) {
          const { name, getData } = items[idx];
          console.info(`Uploading page ${page.pageNumber} from file ${name}...`);
          await uploadToCloudinary({ services, buffer: await getData(), page, folder, context });
          services.reportDocumentPageUploaded(page.pageNumber);
        }
      };

      switch (effectiveMimeType) {
        case "application/x-rar": case "application/octet-stream": {
          const extractor = await createExtractorFromData({ data: new Uint8Array(buffer).buffer, ...(unrarWasmBinary && { wasmBinary: unrarWasmBinary }) });
          const extracted = extractor.extract();
          const files = [...extracted.files]
            .filter(f =>
              f.extraction?.length &&
              f.fileHeader.name.split('/').length === 1 &&
              inferMimeType(f.fileHeader.name) &&
              ALLOWED_IMAGE_MIME_TYPES.has(inferMimeType(f.fileHeader.name)!)
            )
            .sort((a, b) => a.fileHeader.name.localeCompare(b.fileHeader.name));
          await uploadDocumentPages(files.map(f => ({ name: f.fileHeader.name, getData: async () => Buffer.from(f.extraction!) })));
          break;
        }

        case "application/zip": {
          const files = Object.entries(unzipSync(new Uint8Array(buffer)))
            .filter(([name]) =>
              name.split('/').length === 1 &&
              inferMimeType(name) &&
              ALLOWED_IMAGE_MIME_TYPES.has(inferMimeType(name)!)
            )
            .sort(([a], [b]) => a.localeCompare(b));
          await uploadDocumentPages(files.map(([name, data]) => ({ name, getData: async () => Buffer.from(data) })));
          break;
        }

        case "application/pdf": {
          const pdf = await getDocumentProxy(new Uint8Array(buffer));
          await uploadDocumentPages(
            Array.from({ length: pdf.numPages }, (_, i) => ({
              name: `page ${i + 1}`,
              getData: async () => {
                const dataUrl = await renderPageAsImage(pdf, i + 1, { toDataURL: true, canvasImport });
                return Buffer.from(dataUrl.split(",")[1], "base64");
              },
            }))
          );
          break;
        }
      }
    } else {
      const page = indexation.pages.find(({ pageNumber }) => pageNumber === firstPageNumber)!;
      await uploadToCloudinary({ services, buffer, page, folder, context });
      services.reportDocumentPageUploaded(page.pageNumber);
    }

    return { status: "OK" };
  } catch (error) {
    const returnedError =
      error instanceof Error
        ? error.message
        : "Cloudinary upload failed: " + JSON.stringify(error);
    console.error(returnedError);
    return { error: returnedError };
  }
};

export const handleHttpFileUpload = async (
  io: Server,
  { indexationId, user, buffer, fileName, mimeType, firstPageNumber, firstOutOfRangePageNumber }: {
    indexationId: string;
    user: SessionDataWithIndexation["user"];
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    firstPageNumber: number;
    firstOutOfRangePageNumber: number;
  },
) => {
  const indexation = await prisma.indexation.findUnique({
    where: { id: indexationId, dmUserId: user.id },
    include: indexationPayloadInclude,
  });
  if (!indexation) return { error: "Indexation not found" };
  indexation.entries = indexation.entries.sort((a, b) => a.position - b.position);
  const services = makeServicesProxy(io, indexationId, user, indexation);
  return uploadPages(services, { buffer, fileName, mimeType, firstPageNumber, firstOutOfRangePageNumber });
};

const listenEvents = (services: IndexationServices) => ({
  setPageUrl: async (id: number, url: string | null) => setPageUrl(services, id, url),

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
        }),
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
    suggestion: Prisma.storySuggestionUncheckedCreateInput,
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
    suggestion: Omit<
      Prisma.issueSuggestionUncheckedCreateInput,
      "indexationId"
    >,
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
                id: {
                  not: createdIssueSuggestion.id, // Only one user-based issue suggestion
                },
              },
            }),
          )
          .then(async () => {
            await refreshIndexation(services);
            return createdIssueSuggestion;
          }),
      ),

  updateIndexation: async (
    indexation: Pick<indexation, "price" | "releaseDate" | "title"> & {
      numberOfPages: number;
    },
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
        ({ pageNumber }) => pageNumber,
      ),
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
    storySuggestionId: storySuggestion["id"] | null,
  ) => {
    const entry = services._socket.data.indexation.entries.find(
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
    const entry = services._socket.data.indexation.entries.find(
      ({ id }) =>  id === entryId
    );
    if (!entry) {
      return {
        error: `This indexation does not have any entry with this ID`,
        errorDetails: JSON.stringify({ entryId }),
      };
    }
    const suggestion = entry.storyKindSuggestions.find(
      ({ id }) => id === storyKindSuggestionId,
    );
    if (storyKindSuggestionId && !suggestion) {
      return {
        error: `This indexation does not have any entry with this story kind suggestion`,
        errorDetails: JSON.stringify({ storyKindSuggestionId }),
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
      | "title"
      | "position"
    >,
  ) => {
    const entry = services._socket.data.indexation.entries.find(
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

    if (!entry.includedInEntryId) {
      await refreshIndexation(services);
    }

    return { status: "OK" };
  },

  createEntry: async (position: number, includedInEntryId: number|undefined = undefined) =>
    createEntry(services._socket.data.indexation.id, position, includedInEntryId)
      .then(async ({ id, includedInEntryId }) => {
        if (!includedInEntryId) {
          await refreshIndexation(services);
        }
        return { 
          entry: services._socket.data.indexation.entries.find(({id: entryId}) => entryId === id)!, 
          status: "OK"
        };
      }),
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
  },
);

export type ClientEmitEvents = (typeof client)["emitEvents"];
export type ClientListenEvents = (typeof client)["listenEventsInterfaces"];

export const createEntry = async (indexationId: string, position: number, includedInEntryId: number|undefined = undefined) =>
  prisma.entry.create({
    include: {
      storyKindSuggestions: true,
    },
    data: {
      position,
      entirepages: 1,
      includedInEntry: includedInEntryId ? {
        connect: {
          id: includedInEntryId,
        },
      } : undefined,
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
