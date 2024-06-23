import type { BookcaseContributor } from "~dm-types/BookcaseContributor";
import type { MedalPointsPerUser } from "~dm-types/MedalPointsPerUser";
import type { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";
import type { user } from "~prisma-clients/extended/dm.extends";
import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/global-stats";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getBookcaseContributors: (
    callback: (value: BookcaseContributor[]) => void,
  ) => void;
  abstract getUserList: (
    callback: (value: Pick<user, "id" | "username">[]) => void,
  ) => void;
  abstract getUserCount: (callback: (count: number) => void) => void;
  abstract getUsersPointsAndStats: (
    userIds: number[],
    callback: (
      value: Errorable<
        {
          points: MedalPointsPerUser;
          stats: QuickStatsPerUser;
        },
        "Bad request"
      >,
    ) => void,
  ) => void;
  abstract getUsersCollectionRarity: (
    callback: (value: {
      userScores: { userId: number; averageRarity: number }[];
      myScore: number;
    }) => void,
  ) => void;
}
