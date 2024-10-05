import type { edge } from "~prisma-schemas/schemas/dm";

export type EdgeWithModelIdAndIssuecode = edge & {
  modelId?: number;
  v3: boolean;
};
