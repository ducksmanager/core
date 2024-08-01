import type { edge } from "~prisma-clients/schemas/dm";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
