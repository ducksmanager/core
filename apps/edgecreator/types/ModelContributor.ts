import { userContributionType } from "~prisma_clients/client_dm";

import { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuenumber: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
