import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { MedalPoints } from "~dm-types/MedalPoints";
import { SimpleUserWithQuickStats } from "~dm-types/SimpleUserWithQuickStats";
import { user } from "~prisma-clients/client_dm";

export interface Services {
  getBookcaseContributors: (
    callback: (value: BookcaseContributor[]) => void
  ) => void;
  getUserList: (
    callback: (value: Pick<user, "id" | "username">[]) => void
  ) => void;
  getUserCount: (callback: (count: number) => void) => void;
  getUsersPointsAndStats: (
    userIds: number[],
    callback: (value: {
      points: MedalPoints;
      stats: SimpleUserWithQuickStats[];
    }) => void
  ) => void;
  getUsersCollectionRarity: (
    callback: (value: {
      userScores: { userId: number; averageRarity: number }[];
      myScore: number;
    }) => void
  ) => void;
}

export const NamespaceEndpoint = "/global-stats";
