import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { MedalPoints } from "~dm-types/MedalPoints";
import { SimpleUserWithQuickStats } from "~dm-types/SimpleUserWithQuickStats";
import { user } from "~prisma-clients/client_dm";

import { NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  getBookcaseContributors: (callback: (value: BookcaseContributor[]) => void) => void;
  getUserList: (callback: (value: Pick<user, "id" | "username">[]) => void) => void;
  getUserCount: (callback: (value: { count: number }) => void) => void;
  getUsersPointsAndStats: (userIds: number[], callback: (value: {
    points: MedalPoints;
    stats: SimpleUserWithQuickStats[];
  }) => void) => void;
  getUsersCollectionRarity: (callback: (value: {
    userScores: { userId: number; averageRarity: number }[];
    myScore: number;
  }) => void) => void
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/global-stats'
}
