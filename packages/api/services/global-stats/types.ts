import type { BookcaseContributor } from "~dm-types/BookcaseContributor";
import type { MedalPointsPerUser } from "~dm-types/MedalPointsPerUser";
import type { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";
import type { user } from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/global-stats" }
;export type Events =  {


  getBookcaseContributors: (
    ) => BookcaseContributor[]
  getUserList: (
    ) => Pick<user, "id" | "username">[]
  getUserCount: () => number
  getUsersPointsAndStats: (
    userIds: number[]) => Errorable<
        {
          points: MedalPointsPerUser;
          stats: QuickStatsPerUser;
        },
        "Bad request"
      >,
    
  getUsersCollectionRarity: (
    ) => {
      userScores: { userId: number; averageRarity: number }[];
      myScore: number;
    }
}
