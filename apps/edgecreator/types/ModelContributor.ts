import type { userContributionType } from "~prisma-clients/schemas/dm";
import type { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuenumber: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
