import type {
  entry,
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
      aiKumikoResultPanels: true,
      aiOcrPossibleStories: {
        include: {
          storySuggestion: true,
        },
      },
      aiOcrResults: true,
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

export type IndexationWithFirstPage = Prisma.indexationGetPayload<{
  include: {
    pages: {
      take: 1;
      orderBy: {
        pageNumber: "asc";
      };
    };
  };
}>;

export default abstract class {
  static namespaceEndpoint: string = "/indexation/{id}";

  abstract addPage: (
    pageNumber: number,
    url: string,
    callback: () => void,
  ) => void;

  abstract loadIndexation: (
    callback: (
      data: Errorable<{ indexation: FullIndexation }, "Error">,
    ) => void,
  ) => void;

  abstract createOcrDetails: (
    suggestion: Prisma.aiOcrPossibleStoryCreateInput,
    callback: (
      data: Errorable<
        { status: "OK" },
        "You are not allowed to update this resource"
      >,
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

  abstract updateIssueSuggestion: (
    values: Pick<
      issueSuggestion,
      "price"
    >,
    callback: (
      data: { status: "OK" }
    ) => void,
  ) => void;

  abstract acceptIssueSuggestion: (
    suggestionId: issueSuggestion["id"] | null,
    callback: (data: { status: "OK" }) => void,
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

  abstract runKumiko: (
    entryId: entry["id"],
    callback: (
      data: Errorable<{ status: "OK" }, "Kumiko output could not be parsed">,
    ) => void,
  ) => void;

  abstract runKumikoOnPage: (
    page: page["id"],
    callback: (
      data: Errorable<{ status: "OK" }, "Kumiko output could not be parsed">,
    ) => void,
  ) => void;

  abstract updatePageUrls: (
    pages: {
      id: number;
      url: string | null;
  }[],
    callback: (
      data: { status: "OK" },
    ) => void,
  ) => void;

  abstract runOcr: (
    entryId: entry["id"],
    callback: (
      data: Errorable<
        { status: "OK" },
        "OCR error" | "This entry is not a story" | "This entry does not have a page URL associated"
      >,
    ) => void,
  ) => void;

  abstract createEntry: (callback: () => void) => void;
}
