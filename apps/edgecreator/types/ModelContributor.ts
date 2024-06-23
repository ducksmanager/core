import type { userContributionType } from "~prisma-clients/extended/dm.extends";
import type { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuenumber: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
