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

export type IndexationSocket = Socket<
  object,
  IndexationServerSentStartEndEvents,
  object,
  SessionDataWithIndexation
>;

// The services proxy only ever *emits* server-sent events and reads `_socket`,
// so it does not need the client->server listenEvents type. Keeping it out of
// this type is what lets the worker process reuse the proxy without importing
// the socket server registration.
export type IndexationServices = NamespaceProxyTarget<
  IndexationSocket,
  IndexationServerSentStartEndEvents
>;

// The server-sent events, as an emit-only proxy (built by the library's
// `getServerSentEvents` around a Socket, a Namespace, or a Redis emitter). This
// is all the AI pipeline and the HTTP-upload path need — no fake socket.
export type IndexationEvents = IndexationServerSentStartEndEvents;

// Everything the AI pipeline needs, threaded explicitly instead of hidden on a
// socket's `data`. `indexation` is the current snapshot, refreshed as the
// pipeline persists results.
export type IndexationAiContext = {
  events: IndexationEvents;
  userId: SessionDataWithIndexation["user"]["id"];
  indexation: FullIndexation;
};

export const fetchFullIndexation = async (
  userId: SessionDataWithIndexation["user"]["id"],
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
// mutations enqueue an AI job separately (see queue/indexation-ai.queue.ts).
export const refreshIndexation = async (
  events: IndexationEvents,
  userId: SessionDataWithIndexation["user"]["id"],
  indexationId: string,
): Promise<FullIndexation> => {
  const indexation = (await fetchFullIndexation(userId, indexationId))!;
  events.indexationUpdated(indexation);
  return indexation;
};
