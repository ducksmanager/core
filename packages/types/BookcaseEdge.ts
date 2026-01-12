import type { edge } from "~prisma-schemas/schemas/dm/client/client";

export interface BookcaseEdgeSprite {
  name: string;
  version: string;
  size: number;
}

export interface BookcaseEdge extends edge {
  edgeId: number;
  sprites: BookcaseEdgeSprite[];
}
