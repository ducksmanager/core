import type {
  entry,
  indexation,
  issueSuggestion,
  page,
  Prisma,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";
import type { Errorable } from "~socket.io-services";

export const indexationPayloadInclude = {
  pages: {
    include: {
      image: {
        include: {
          aiKumikoResultPanels: true,
          aiOcrResults: true,
        },
      },
    },
  },
  acceptedIssueSuggestion: true,
  issueSuggestions: true,
  entries: {
    include: {
      acceptedStory: {
        include: {
          ocrDetails: true,
        },
      },
      acceptedStoryKind: true,
      storyKindSuggestions: true,
      storySuggestions: {
        include: {
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

  abstract deleteIndexation: (callback: () => void) => void;

  abstract loadIndexation: (
    callback: (
      data: Errorable<{ indexation: FullIndexation }, "Error">,
    ) => void,
  ) => void;

  abstract createStorySuggestion: (
    suggestion: Prisma.storySuggestionUncheckedCreateInput,
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
    >,
    callback: (data: { suggestionId: storySuggestion["id"] }) => void,
  ) => void;

  abstract updateIndexation: (
    values: Pick<indexation, "price">,
    callback: (data: { status: "OK" }) => void,
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

  abstract runKumikoOnPage: (
    pageId: page["id"],
    callback: (
      data: Errorable<
        { status: "OK" },
        | "This indexation does not have any page with this ID"
        | "Kumiko output could not be parsed"
      >,
    ) => void,
  ) => void;

  abstract swapPageUrls: (
    pageNumber1: number,
    pageNumber2: number,
    callback: (data: { status: "OK" }) => void,
  ) => void;

  abstract updateNumberOfPages: (
    numberOfPages: number,
    callback: (
      data: Errorable<{ status: "OK" }, "Invalid number of pages">,
    ) => void,
  ) => void;

  abstract createStorySuggestions: (
    entryId: entry["id"],
    callback: (
      data: Errorable<
        { status: "OK" },
        | "OCR error"
        | "This entry is not a story"
        | "This entry does not have a page URL associated"
      >,
    ) => void,
  ) => void;

  abstract createEntry: (callback: () => void) => void;
}

export interface ServerSentEvents {
  setInferredEntryStoryKind: (entryId: number) => void;
  setInferredEntryStoryKindEnd: (entryId: number) => void;

  setKumikoInferredPageStoryKinds: (pageId: number) => void;
  setKumikoInferredPageStoryKindsEnd: (pageId: number) => void;
}
