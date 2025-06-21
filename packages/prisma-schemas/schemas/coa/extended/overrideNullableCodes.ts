import type { inducks_issue } from "../../../client_coa";

export const computePublicationcode = {
  publicationcode: {
    needs: {
      publicationcode: true,
    },
    compute: ({
      publicationcode,
    }: {
      publicationcode: inducks_issue["publicationcode"];
    }) => publicationcode!,
  },
};

export const computeIssuenumber = {
  issuenumber: {
    needs: {
      issuenumber: true,
    },
    compute: ({ issuenumber }: { issuenumber: inducks_issue["issuenumber"] }) =>
      issuenumber!,
  },
};
