import { ImageElement } from "~dm-types/ImageElement";
import { ModelSteps } from "~dm-types/ModelSteps";
import { edgeContributor, edgeModel, elementImage } from "~prisma-clients/client_edgecreator";

import { Errorable } from "../types";

export default abstract class {
  static namespaceEndpoint = "/edgecreator";
  abstract submitEdge: (
    publicationcode: string,
    issuenumber: string,
    callback: (value: { url: string }) => void
  ) => void;
  abstract getModelContributors: (
    modelId: number,
    callback: (value: edgeContributor[]) => void
  ) => void;
  abstract getImagesFromFilename: (
    filename: string,
    callback: (value: ImageElement[]) => void
  ) => void;


  abstract publishEdge: (
    data: {
      publicationcode: string;
      issuenumber: string;
      designers: string[];
      photographers: string[];
    },
    callback: (
      data: Errorable<
        {
          publicationcode: string;
          issuenumber: string;
          isNew: boolean;
          edgeId: number;
          contributors: number[];
          url: string;
        },
        "Invalid publication code"
      >
    ) => void
  ) => void;

  abstract uploadEdges: (callback: () => void) => void;


  abstract getUnassignedEdges: (callback: (data: edgeModel[]) => void) => void;
  abstract getEdgesEditedByOthers: (callback: (data: edgeModel[]) => void) => void;
  abstract getModelsSteps: (modelIds: number[], callback: (data: ModelSteps) => void) => void;
  abstract getModelMainPhoto: (modelId: number, callback: (data: Pick<elementImage, "id" | "fileName">) => void) => void;
  abstract getModel: (publicationcode: string, issuenumber: string, callback: (data: edgeModel | null) => void) => void;


  abstract sendNewEdgePhotoEmail: (publicationcode: string,
    issuenumber: string, callback: (data: { url: string }) => void) => void;
  abstract createElementImage: (hash: string,
    fileName: string, callback: (data: { photoId: number }) => void) => void;
  abstract checkTodayLimit: (callback: (data: {
    uploadedFilesToday: string[];
  }) => void) => void;
  abstract getImageByHash: (hash: string, callback: (data: elementImage | null) => void) => void;
}

