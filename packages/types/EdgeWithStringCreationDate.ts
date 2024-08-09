import type { edge } from "~prisma-schemas/schemas/dm";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
