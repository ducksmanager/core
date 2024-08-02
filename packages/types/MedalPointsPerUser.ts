import type { UserContributionTypeEn } from "./UserContributionTypeEn";


export type MedalPointsPerUser = {
  [userId: number]: Record<
  UserContributionTypeEn,
    number
  >;
};
