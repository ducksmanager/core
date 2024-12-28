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

export default abstract class {
  static namespaceEndpoint: string = "/indexation/{id}";

  abstract setPageUrl: (
    id: number,
    url: string | null,
    callback: (
      data: Errorable<
        "OK",
        "This indexation does not have any page with this ID"
      >,
    ) => void,
  ) => void;
  
  abstract deleteEntry: (
    entryId: entry["id"],
    entryIdToExtend: "previous" | "next",
    callback: (
      data: Errorable<
        { status: "OK" },
        "This indexation does not have any entry with this ID"|
        "This entry does not have any previous entry"|
        "This entry does not have any next entry"
      >,
    ) => void,
  ) => void;

  abstract deleteIndexation: (callback: () => void) => void;

  abstract loadIndexation: (
    callback: (
      data: Errorable<{ indexation: FullIndexation }, "Error">,
    ) => void,
  ) => void;

  abstract createStorySuggestion: (
    suggestion: Prisma.storySuggestionUncheckedCreateInput & { ai: boolean },
    callback: (
      data: Errorable<
        { createdStorySuggestion: Pick<storySuggestion, "id" | "storycode"> },
        "You are not allowed to update this resource"
      >,
    ) => void,
  ) => void;

  abstract acceptStorySuggestion: (
    entryId: entry["id"],
    storySuggestionId: storySuggestion["id"] | null,
    callback: (
      data: Errorable<
        { status: "OK" },
        "This indexation does not have any entry with this suggestion"
      >,
    ) => void,
  ) => void;

  abstract createIssueSuggestion: (
    suggestion: Omit<
      Prisma.issueSuggestionUncheckedCreateInput,
      "indexationId"
    > & { ai: boolean },
    callback: (data: { suggestionId: storySuggestion["id"] }) => void,
  ) => void;

  abstract updateIndexation: (
    values: Pick<indexation, "price"> & { numberOfPages: number },
    callback: (
      data: Errorable<{ status: "OK" }, "Invalid number of pages">,
    ) => void,
  ) => void;

  abstract acceptIssueSuggestion: (
    suggestionId: issueSuggestion["id"] | null,
    callback: (
      data: Errorable<
        { status: "OK" },
        "This issue suggestion does not exist in this indexation"
      >,
    ) => void,
  ) => void;

  abstract acceptStoryKindSuggestion: (
    entryId: entry["id"],
    storyKindSuggestionId: storyKindSuggestion["id"] | null,
    callback: (
      data: Errorable<
        { status: "OK" },
        | "This indexation does not have any entry with this story kind suggestion"
        | "This indexation does not have any entry with this ID"
      >,
    ) => void,
  ) => void;

  abstract updateEntry: (
    entryId: entry["id"],
    values: Pick<
      entry,
      "entirepages" | "brokenpagenumerator" | "brokenpagedenominator" | "title"
    >,
    callback: (
      data: Errorable<
        { status: "OK" },
        "This indexation does not have any entry with this ID"
      >,
    ) => void,
  ) => void;

  abstract swapPageUrls: (
    pageNumber1: number,
    pageNumber2: number,
    callback: (data: { status: "OK" }) => void,
  ) => void;

  abstract createEntry: (callback: (data: { status: "OK" }) => void) => void;
}

export type ServerSentStartEvents = {
  setKumikoInferredPageStoryKinds: (pageId: number) => void;
  setInferredEntryStoryKind: (entryId: number) => void;
  createAiStorySuggestions: (entryId: number) => void;
  runOcrOnImage: (imageId: number) => void;
};

export type ServerSentEndEvents = {
  [K in keyof ServerSentStartEvents as `${K}End`]: ServerSentStartEvents[K];
};

export type ServerSentEvents = ServerSentStartEvents & ServerSentEndEvents;
