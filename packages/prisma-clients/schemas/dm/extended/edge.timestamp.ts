import { edge } from "../../../client_dm";

export const computeTimestamp = {
  timestamp: {
    needs: {
      creationDate: true,
    },
    compute: ({ creationDate }: { creationDate: edge["creationDate"] }) =>
      creationDate.getTime() / 1000,
  },
};
