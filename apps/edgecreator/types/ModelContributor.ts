import { userContributionType } from "ducksmanager/api/dist/prisma/client_dm";

import { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuenumber: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
