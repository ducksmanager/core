import { ResourceApiResponse } from "cloudinary";

import { KumikoResult } from "~dumili-types/KumikoResult";
import { OcrResult } from "~dumili-types/OcrResults";
import { Errorable } from '~socket.io-services/types';

export type ResourceApiResponseWithCustomUser = ResourceApiResponse & { resources: [{ context: {custom: { user: string, indexation: string } }}] };


export default abstract class {
  static namespaceEndpoint: string = "/cloudinary-indexations";

  abstract getResources: (callback: (data: Errorable<ResourceApiResponseWithCustomUser, "Cloudinary error">) => void) => void;
}
export abstract class IndexationEvents {
  abstract getIndexationResources: (callback: (data: Errorable<ResourceApiResponse, "Cloudinary error">) => void) => void;

  abstract getKumikoResults: (callback: (data: Errorable<{data: KumikoResult[]}, "Kumiko output could not be parsed">) => void) => void;

  abstract getOcrResults: (pageUrl: string, callback: (data: Errorable<{data: OcrResult[]}, "Invalid page URL">) => void) => void;
 
}