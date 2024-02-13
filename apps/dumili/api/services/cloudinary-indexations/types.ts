import { ResourceApiResponse } from "cloudinary";

import { KumikoResult } from "~dumili-types/KumikoResult";
import { OcrResult } from "~dumili-types/OcrResults";
import { EntrySuggestion, StoryversionKindSuggestion } from "~dumili-types/suggestions";
import { Errorable } from '~socket.io-services/types';

export type ResourceCustomContextStrings = {
  custom: { user: string; indexation: string; page: string; entrySuggestions?: string, storyversionKindSuggestions?: string };
};

export type ResourceCustomContext =  {custom: { user: string, indexation: string, project: string, entrySuggestions?: EntrySuggestion[], storyversionKindSuggestions?: StoryversionKindSuggestion[] } }


export type ResourcesWithContext =
  (Omit<ResourceApiResponse['resources']['0'], 'context'>
 & { context: ResourceCustomContext })[]
export type ResourcesWithContextStrings = 
  (Omit<ResourceApiResponse['resources']['0'], 'context'>
 & { context: ResourceCustomContextStrings })[]

export default abstract class {
  static namespaceEndpoint: string = "/cloudinary-indexations";

  abstract getResources: (callback: (data: Errorable<{resources: ResourcesWithContext}, "Cloudinary error">) => void) => void;
}
export abstract class IndexationEvents {
  abstract getIndexationResources: (callback: (data: Errorable<{resources: ResourcesWithContext}, "Cloudinary error">) => void) => void;

  abstract getKumikoResults: (callback: (data: Errorable<{data: KumikoResult[]}, "Kumiko output could not be parsed">) => void) => void;

  abstract getOcrResults: (pageUrl: string, callback: (data: Errorable<{data: OcrResult[]}, "Invalid page URL"|"OCR error">) => void) => void;

  abstract updateIndexationResource: (url: string, suggestions: {entrySuggestions: EntrySuggestion[], storyversionKindSuggestions?: StoryversionKindSuggestion[] }, callback: (data: Errorable<void, 'You are not allowed to update this resource'>) => void) => void
 
}