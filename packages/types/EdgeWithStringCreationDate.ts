import { edge } from "~prisma-clients/client_dm";

export type EdgeWithStringCreationDate = Omit<edge, "creationDate"> & {
  creationDate: string;
};
