
import { KumikoResult } from "~dumili-types/KumikoResult";
import { OcrResult } from "~dumili-types/OcrResults";
import { Prisma, storySuggestion } from "~prisma/client_dumili";
import { Errorable } from '~socket.io-services/types';


export type FullIndexation = Prisma.indexationGetPayload<{
  include: {
    pages: true,
    acceptedIssueSuggestion: true,
    issueSuggestions: true,
    entries: {
      include: {
        acceptedSuggestedStory: true,
        acceptedSuggestedStoryKind: true,
        storyKindSuggestions: true,
        storySuggestions: true
      }
    }
  }
}>

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
  abstract getIndexation: (callback: (data: Errorable<{indexation: FullIndexation}, "Error">) => void) => void;

  abstract createStorySuggestion: (suggestion: Prisma.storySuggestionUncheckedCreateInput, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;
  
  abstract acceptStorySuggestion: (suggestion: storySuggestion, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract acceptIssueSuggestion: (suggestion: Prisma.issueSuggestionUncheckedCreateInput, callback: (data: Errorable<{status: 'OK'}, 'You are not allowed to update this resource'>) => void) => void;

  abstract getKumikoResults: (callback: (data: Errorable<{data: KumikoResult[]}, "Kumiko output could not be parsed">) => void) => void;

  abstract getOcrResults: (pageUrl: string, callback: (data: Errorable<{data: OcrResult[]}, "Invalid page URL"|"OCR error">) => void) => void;

  abstract updateIndexation: (indexation: FullIndexation, callback: (data: Errorable<void, 'You are not allowed to update this resource'>) => void) => void
 
}