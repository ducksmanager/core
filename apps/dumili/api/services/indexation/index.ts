import { v2 as cloudinary } from "cloudinary";
import type { Server } from "socket.io";
import { getServerSentEvents, useSocketEvents } from "socket-call-server";

import prisma from "~prisma/client";
import type {
  entry,
  indexation,
  issueSuggestion,
  page,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili/client";

import type { SessionDataWithIndexation } from "../../index";
import { enqueueIndexationAi } from "../../queue/indexation-ai.queue";
import { RequiredAuthMiddleware } from "../_auth";
import namespaces from "../namespaces";
import {
  fetchFullIndexation,
  type FullIndexation,
  type IndexationEvents,
  type IndexationServerSentStartEndEvents,
  type IndexationServices,
  refreshIndexation,
} from "./context";

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { definePDFJSModule, getDocumentProxy, renderPageAsImage } from "unpdf";

import { createExtractorFromData } from "node-unrar-js";
import { unzipSync } from "fflate";

await definePDFJSModule(() => import("pdfjs-dist"));

// In the production bundle, bun bakes in the CI build path for unrar.wasm.
// We override it by loading the file explicitly when it's present next to the bundle.
// In local dev (unbundled), node-unrar-js resolves the path itself so we leave it undefined.
const bundleSideWasm = join(dirname(fileURLToPath(import.meta.url)), "unrar.wasm");
const unrarWasmBinary = existsSync(bundleSideWasm)
  ? (() => { const buf = readFileSync(bundleSideWasm); return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); })()
  : undefined;

const canvasImport = () => import("@napi-rs/canvas");

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
  const extension = value?.toLowerCase()?.split(".")?.pop();
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

const uploadToCloudinary = async ({ events, userId, indexation, folder, context, page, ...params }: {
  events: IndexationEvents;
  userId: SessionDataWithIndexation["user"]["id"];
  indexation: FullIndexation;
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

          await setPageUrl(indexation, page.id, result.secure_url);
          await refreshIndexation(events, userId, indexation.id);
          resolve();
        }
      },
    );
    stream.end(params.buffer);
  },
);

const setPageUrl = async (
  indexation: FullIndexation,
  id: number,
  url: string | null,
) => {
  if (!indexation.pages.some(({ id: pageId }) => pageId === id)) {
    return {
      error: "This indexation does not have any page with this ID",
    };
  }
  await prisma.page.update({
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
  });
  return "OK" as const;
};

export type {
  FullIndexation,
  FullEntry,
  IndexationServerSentStartEvents,
  IndexationServerSentStartEndEvents,
  IndexationNumberIdEvent,
} from "./context";

// Enqueues an AI run for the current indexation (deduplicated + coalesced).
const enqueueAi = (services: IndexationServices) =>
  enqueueIndexationAi(
    services._socket.data.indexation.id,
    services._socket.data.user.id,
  );

// Connection-path refresh: re-fetch, emit `indexationUpdated`, and keep the
// socket's snapshot current for subsequent handler calls.
const refreshConnection = async (services: IndexationServices) => {
  services._socket.data.indexation = await refreshIndexation(
    services,
    services._socket.data.user.id,
    services._socket.data.indexation.id,
  );
};

const uploadPages = async (
  events: IndexationEvents,
  user: SessionDataWithIndexation["user"],
  indexation: FullIndexation,
  {
    buffer, fileName, mimeType, firstPageNumber, firstOutOfRangePageNumber,
  }: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    firstPageNumber: number;
    firstOutOfRangePageNumber: number;
  }) => {
  try {
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
        events.reportDocumentAnalyzed(pagesToOverwrite.map(({ pageNumber }) => pageNumber));
        for (const [idx, page] of pagesToOverwrite.entries()) {
          const { name, getData } = items[idx];
          console.info(`Uploading page ${page.pageNumber} from file ${name}...`);
          await uploadToCloudinary({ events, userId: user.id, indexation, buffer: await getData(), page, folder, context });
          events.reportDocumentPageUploaded(page.pageNumber);
        }
      };

      switch (effectiveMimeType) {
        case "application/x-rar": case "application/octet-stream": {
          const extractor = await createExtractorFromData({ data: new Uint8Array(buffer).buffer, ...(unrarWasmBinary && { wasmBinary: unrarWasmBinary }) });
          const extracted = extractor.extract();
          const files = [...extracted.files]
            .filter(f =>
              f.extraction?.length &&
              f.fileHeader.name.split("/").length === 1 &&
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
              name.split("/").length === 1 &&
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
      await uploadToCloudinary({ events, userId: user.id, indexation, buffer, page, folder, context });
      events.reportDocumentPageUploaded(page.pageNumber);
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
  const indexation = await fetchFullIndexation(user.id, indexationId);
  if (!indexation) return { error: "Indexation not found" };
  const events = getServerSentEvents<IndexationServerSentStartEndEvents>(
    io.of(`/indexation/${indexationId}`),
  );
  const result = await uploadPages(events, user, indexation, { buffer, fileName, mimeType, firstPageNumber, firstOutOfRangePageNumber });
  if (!("error" in result)) {
    await enqueueIndexationAi(indexationId, user.id);
  }
  return result;
};

const listenEvents = (services: IndexationServices) => ({
  setPageUrl: async (id: number, url: string | null) => {
    const result = await setPageUrl(services._socket.data.indexation, id, url);
    if (result === "OK") {
      await refreshConnection(services);
      await enqueueAi(services);
    }
    return result;
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

    await refreshConnection(services);
    await enqueueAi(services);

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
        await refreshConnection(services);
        await enqueueAi(services);
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
        await refreshConnection(services);
        await enqueueAi(services);
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
        await refreshConnection(services);
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
            await refreshConnection(services);
            await enqueueAi(services);
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
      .then(() => refreshConnection(services))
      .then(() => enqueueAi(services))
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

    await refreshConnection(services);
    return { status: "OK" };
  },

  acceptStoryKindSuggestion: async (
    entryId: entry["id"],
    storyKindSuggestionId: storyKindSuggestion["id"] | null,
  ) => {
    const entry = services._socket.data.indexation.entries.find(
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

    await refreshConnection(services);
    await enqueueAi(services);

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

    await refreshConnection(services);
    await enqueueAi(services);

    return { status: "OK" };
  },

  createEntry: async (position: number) =>
    createEntry(services._socket.data.indexation.id, position)
      .then(() => refreshConnection(services))
      .then(() => enqueueAi(services))
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

        const { user } = services._socket.data;
        const indexation = await fetchFullIndexation(user.id, indexationId);
        if (!indexation) {
          next(new Error("Indexation not found"));
          return;
        }
        services._socket.data.indexation = indexation;
        services.indexationUpdated(indexation);
        await enqueueIndexationAi(indexationId, user.id);
        next();
      },
    ],
  },
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
