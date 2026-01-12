import type { edge } from "~prisma-schemas/schemas/dm/client/client";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
