import { edge } from "~prisma-clients/extended/dm.extends";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
