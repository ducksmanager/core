import type { edge } from "~prisma-clients/schemas/dm";

export interface BookcaseEdgeSprite {
  name: string;
  version: string;
  size: number;
}

export interface BookcaseEdge extends edge {
  edgeId: number;
  sprites: BookcaseEdgeSprite[];
}