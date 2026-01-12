import type { userContributionType } from "~prisma-schemas/schemas/dm/client/client";
import type { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuecode: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
