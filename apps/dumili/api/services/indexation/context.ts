import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { type ServerSentStartEndEvents } from "socket-call-server";

import prisma from "~prisma/client";
import type { Prisma } from "~prisma/client_dumili/client";

import type { SessionDataWithIndexation } from "../../index";

export const indexationPayloadInclude = {
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
      acceptedStory: true,
      acceptedStoryKind: { include: { storyKindRows: true } },
      storyKindSuggestions: { include: { storyKindRows: true } },
      storySuggestions: {
        include: {
          aiStorySuggestion: {
            include: {
              aiStorySearchPossibleStory: true,
            },
          },
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

// The "start" events whose handler receives a single numeric id (i.e. every one
// except reportDocumentAnalyzed, which receives a number[]).
export type IndexationNumberIdEvent = {
  [K in keyof IndexationServerSentStartEvents]: IndexationServerSentStartEvents[K] extends (
    id: number,
  ) => void
    ? K
    : never;
}[keyof IndexationServerSentStartEvents];

export type IndexationSocket = Socket<
  object,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>;

export type IndexationServices = NamespaceProxyTarget<
  IndexationSocket,
  IndexationServerSentStartEndEvents
>;

export type IndexationEvents = IndexationServerSentStartEndEvents;

export type UserId = SessionDataWithIndexation["user"]["id"]

export type IndexationAiContext = {
  events: IndexationEvents;
  userId: UserId;
  indexation: FullIndexation;
};

export const fetchFullIndexation = async (
  userId: UserId,
  id: string,
) => {
  const indexation = await prisma.indexation.findUnique({
    where: { id, dmUserId: userId },
    include: indexationPayloadInclude,
  });
  if (indexation) {
    indexation.entries = indexation.entries.sort(
      (a, b) => a.position - b.position,
    );
  }
  return indexation;
};

// Re-fetches the indexation from the DB and pushes it to connected clients,
// returning the fresh snapshot. AI processing is not triggered from here:
// mutations enqueue an AI job separately.
export const refreshIndexation = async (
  events: IndexationEvents,
  userId: UserId,
  indexationId: string,
) => {
  const indexation = (await fetchFullIndexation(userId, indexationId))!;
  events.indexationUpdated(indexation);
  return indexation;
};
