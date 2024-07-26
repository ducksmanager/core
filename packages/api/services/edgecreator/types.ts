import type { ImageElement } from "~dm-types/ImageElement";
import type { ModelSteps } from "~dm-types/ModelSteps";
import type {
  edgeContributor,
  edgeModel,
  elementImage,
  Prisma,
} from "~prisma-clients/client_edgecreator";
import type { Errorable } from "~socket.io-services/types";

export const unassignedEdgeFields = {
  id: true,
  country: true,
  magazine: true,
  shortIssuenumber: true,
  photos: {
    include: {
      elementImage: true,
    },
  },
  contributors: true,
};

export const namespaceEndpoint = "/edgecreator";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;
  abstract submitEdge: (
    publicationcode: string,
    shortIssuenumber: string,
    callback: (value: { url: string }) => void,
  ) => void;
  abstract getModelContributors: (
    modelId: number,
    callback: (value: edgeContributor[]) => void,
  ) => void;
  abstract getImagesFromFilename: (
    filename: string,
    callback: (value: ImageElement[]) => void,
  ) => void;

  abstract publishEdge: (
    data: {
      shortIssuecode: string;
      designers: string[];
      photographers: string[];
    },
    callback: (
      data: Errorable<
        {
          shortIssuecode: string;
          isNew: boolean;
          edgeId: number;
          contributors: number[];
          url: string;
        },
        "Invalid issue code"
      >,
    ) => void,
  ) => void;

  abstract uploadEdges: (callback: () => void) => void;

  abstract getUnassignedEdges: (
    callback: (
      data: Prisma.edgeModelGetPayload<{
        select: typeof unassignedEdgeFields;
      }>[],
    ) => void,
  ) => void;
  abstract getModelsSteps: (
    modelIds: number[],
    callback: (data: ModelSteps) => void,
  ) => void;
  abstract getModelMainPhoto: (
    modelId: number,
    callback: (data: Pick<elementImage, "id" | "fileName">) => void,
  ) => void;
  abstract getModel: (
    shortIssuecode: string,
    callback: (data: edgeModel | null) => void,
  ) => void;

  abstract sendNewEdgePhotoEmail: (
    shortIssuecode: string,
    callback: (data: { url: string }) => void,
  ) => void;
  abstract createElementImage: (
    hash: string,
    fileName: string,
    callback: (data: { photoId: number }) => void,
  ) => void;
  abstract checkTodayLimit: (
    callback: (data: { uploadedFilesToday: string[] }) => void,
  ) => void;
  abstract getImageByHash: (
    hash: string,
    callback: (data: elementImage | null) => void,
  ) => void;
}
