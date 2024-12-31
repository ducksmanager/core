import type { ImageElement } from "~dm-types/ImageElement";
import type { ModelSteps } from "~dm-types/ModelSteps";
import type {
  edgeContributor,
  edgeModel,
  elementImage,
  Prisma,
} from "~prisma-schemas/schemas/edgecreator";
import type { Errorable } from "~socket.io-services";

export const unassignedEdgeFields = {
  id: true,
  country: true,
  magazine: true,
  issuenumber: true,
  photos: {
    include: {
      elementImage: true,
    },
  },
  contributors: true,
};

export default { namespaceEndpoint: "/edgecreator" }
;export type Events =  {

  submitEdge: (
    issuecode: string) => { url: string }
  getModelContributors: (
    modelId: number) => edgeContributor[]
  getImagesFromFilename: (
    filename: string) => ImageElement[]

  publishEdge: (
    data: {
      issuecode: string;
      designers: string[];
      photographers: string[];
    }) => Errorable<
        {
          issuecode: string;
          isNew: boolean;
          edgeId: number;
          contributors: number[];
          url: string;
        },
        "Invalid publication code and issue number"
      >,
    

  uploadEdges: () => () => Prisma.edgeModelGetPayload<{
        select: typeof unassignedEdgeFields;
      }>[],
    
  getModelsSteps: (
    modelIds: number[]) => ModelSteps,
  getModelMainPhoto: (
    modelId: number) => Pick<elementImage, "id" | "fileName">
  getModel: (
    issuecode: string) => edgeModel | null

  sendNewEdgePhotoEmail: (
    issuecode: string) => { url: string }
  createElementImage: (
    hash: string,
    fileName: string) => { photoId: number }
  checkTodayLimit: (
    ) => { uploadedFilesToday: string[] }
  getImageByHash: (
    hash: string) => elementImage | null
}
