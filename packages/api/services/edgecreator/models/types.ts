import { EdgeModel } from "~dm-types/EdgeModel";
import { ModelSteps } from "~dm-types/ModelSteps";
import { edgeModel, elementImage } from "~prisma-clients/client_edgecreator";

export default interface EdgeSprites {
  getUnassignedEdges: (callback: (data: EdgeModel[]) => void) => void;
  getEdgesEditedByOthers: (callback: (data: EdgeModel[]) => void) => void;
  getModelsSteps: (modelIds: number[], callback: (data: ModelSteps) => void) => void;
  getModelMainPhoto: (modelId: number, callback: (data: Pick<elementImage, "id" | "fileName">) => void) => void;
  getModel: (publicationcode: string, issuenumber: string, callback: (data: edgeModel | null) => void) => void;
}
