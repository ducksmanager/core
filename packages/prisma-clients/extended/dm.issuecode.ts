import { issue } from "../client_dm";

export const computeIssuecode = {
  issuecode: {
    needs: {
      country: true,
      magazine: true,
      issuenumber: true,
    },
    compute: ({
      country,
      magazine,
      issuenumber,
    }: {
      country: (issue)["country"];
      magazine: (issue)["magazine"];
      issuenumber: (issue)["issuenumber"];
    }) => `${country}/${magazine} ${issuenumber}`,
  },
};
