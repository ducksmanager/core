import type {
  entry,
  indexation,
  issueSuggestion,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";
import type { Errorable } from "~socket.io-services";

export const indexationPayloadInclude = {
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

export const namespaceEndpoint = "/indexation/{id}";

export type Events = {
  setPageUrl: (
    id: number,
    url: string | null
  ) => Promise<Errorable<"OK", "This indexation does not have any page with this ID">>;

  deleteEntry: (
    entryId: entry["id"],
    entryIdToExtend: "previous" | "next"
  ) => Promise<Errorable<
    { status: "OK" },
    | "This indexation does not have any entry with this ID"
    | "This entry does not have any previous entry"
    | "This entry does not have any next entry"
  >>;

  deleteIndexation: () => Promise<void>;

  loadIndexation: () => Promise<Errorable<{ indexation: FullIndexation }, "Error">>;

  createStorySuggestion: (
    suggestion: Prisma.storySuggestionUncheckedCreateInput & { ai: boolean }
  ) => Promise<Errorable<
    { createdStorySuggestion: Pick<storySuggestion, "id" | "storycode"> },
    "You are not allowed to update this resource"
  >>;

  acceptStorySuggestion: (
    entryId: entry["id"],
    storySuggestionId: storySuggestion["id"] | null
  ) => Promise<Errorable<
    { status: "OK" },
    "This indexation does not have any entry with this suggestion"
  >>;

  createIssueSuggestion: (
    suggestion: Omit<
      Prisma.issueSuggestionUncheckedCreateInput,
      "indexationId"
    > & { ai: boolean }
  ) => Promise<{ suggestionId: storySuggestion["id"] }>;

  updateIndexation: (
    values: Pick<indexation, "price"> & { numberOfPages: number }
  ) => Promise<Errorable<{ status: "OK" }, "Invalid number of pages">>;

  acceptIssueSuggestion: (
    suggestionId: issueSuggestion["id"] | null
  ) => Promise<Errorable<
    { status: "OK" },
    "This issue suggestion does not exist in this indexation"
  >>;

  acceptStoryKindSuggestion: (
    entryId: entry["id"],
    storyKindSuggestionId: storyKindSuggestion["id"] | null
  ) => Promise<Errorable<
    { status: "OK" },
    | "This indexation does not have any entry with this story kind suggestion"
    | "This indexation does not have any entry with this ID"
  >>;

  updateEntry: (
    entryId: entry["id"],
    values: Pick<
      entry,
      "entirepages" | "brokenpagenumerator" | "brokenpagedenominator" | "title"
    >
  ) => Promise<Errorable<
    { status: "OK" },
    "This indexation does not have any entry with this ID"
  >>;

  swapPageUrls: (pageNumber1: number, pageNumber2: number) => Promise<Errorable<{ status: "OK" }, 'Error'>>;

  createEntry: () => Promise<{ status: "OK" }>;
};
