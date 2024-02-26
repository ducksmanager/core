
import { Prisma, storySuggestion } from "~prisma/client_dumili";
import { Errorable } from '~socket.io-services/types';

export const indexationPayloadInclude = {
    pages: {
      include: {
        aiKumikoResultPanels: true,
        aiOcrPossibleStories: {
          include: {
            storySuggestions: true
          }
        },
        aiOcrResults: true,
      }
    },
    acceptedIssueSuggestion: true,
    issueSuggestions: true,
    entries: {
      include: {
        entryPages: true,
        acceptedSuggestedStory: true,
        acceptedSuggestedStoryKind: true,
        storyKindSuggestions: {
          include: {
            acceptedOnEntries: true
          }
        },
        storySuggestions: true,
      }
    }
} as const

export type FullIndexation = Prisma.indexationGetPayload< {include: typeof indexationPayloadInclude}>

export type IndexationWithFirstPage = Prisma.indexationGetPayload<{
  include: {
    pages: {
      take: 1,
      orderBy: {
        pageNumber: 'asc'
      }
    }
  }
}>

export default abstract class {
  static namespaceEndpoint: string = "/indexations";

  abstract getIndexations: (callback: (data: Errorable<{indexations: IndexationWithFirstPage[]}, "Error">) => void) => void;
}
export abstract class IndexationEvents {
  abstract loadIndexation: (callback: (data: Errorable<{indexation: FullIndexation}, "Error">) => void) => void;

  abstract createOcrDetails: (suggestion: Prisma.aiOcrPossibleStoryCreateInput, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract createStorySuggestion: (suggestion: Prisma.storySuggestionUncheckedCreateInput, callback: (data: Errorable<{suggestionId: storySuggestion['id']}, 'You are not allowed to update this resource'>) => void) => void;
  
  abstract acceptStorySuggestion: (suggestion: storySuggestion, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract acceptIssueSuggestion: (suggestion: Prisma.issueSuggestionUncheckedCreateInput, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract acceptStoryKindSuggestion: (suggestion: Prisma.storyKindSuggestionUncheckedCreateInput, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract runKumiko: (callback: (data: Errorable<{ status: 'OK' }, "Kumiko output could not be parsed">) => void) => void;

  abstract runOcr: (pageUrl: string, callback: (data: Errorable<{status: 'OK'}, "Invalid page URL"|"OCR error">) => void) => void;

  abstract updateIndexation: (indexation: FullIndexation, callback: (data: Errorable<void, 'You are not allowed to update this resource'>) => void) => void
 
}