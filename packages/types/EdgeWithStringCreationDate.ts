import { edge } from "~prisma-schemas/client_dm";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
