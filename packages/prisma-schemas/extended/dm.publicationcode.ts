import { issue, subscription } from "../client_dm";

export const computePublicationcode = {
  publicationcode: {
    needs: {
      country: true,
      magazine: true,
    },
    compute: ({
      country,
      magazine,
    }: {
      country: (issue | subscription)["country"];
      magazine: (issue | subscription)["magazine"];
    }) => `${country}/${magazine}`,
  },
};
