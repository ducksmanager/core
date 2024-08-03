import type { userContributionType } from "~prisma-schemas/schemas/dm";
import type { SimpleUser } from "~types/SimpleUser";

export interface ModelContributor {
  issuecode: string;
  contributionType: userContributionType;
  user: SimpleUser;
}
