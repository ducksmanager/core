

import { ImageElement } from "~dm-types/ImageElement";
import { edgeContributor } from "~prisma-clients/client_edgecreator";

import { NamespaceGeneric, SocketGeneric } from "../types";
import EdgePublication from "./edge-publication/types";
import EdgeSprites from "./edge-sprites/types";
import Models from "./models/types";
import MultipleEdgePhotos from "./multiple-edge-photos/types";

export interface Services
  extends Models, MultipleEdgePhotos, EdgeSprites, EdgePublication {
  submitEdge: (publicationcode: string, issuenumber: string, callback: (value: { url: string }) => void) => void;
  getModelContributors: (modelId: number, callback: (value: edgeContributor[]) => void) => void;
  getImagesFromFilename: (filename: string, callback: (value: ImageElement[]) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/edgecreator'
}
