import { edge } from "~prisma_clients/client_dm";

export const computeTimestamp = {
  timestamp: {
    needs: {
      creationDate: true,
    },
    compute: ({ creationDate }: { creationDate: edge["creationDate"] }) =>
      creationDate.getTime() / 1000,
  },
};
