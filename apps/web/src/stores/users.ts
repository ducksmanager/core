import GlobalStatsServices from "~dm-services/global-stats/types";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { AbstractEvent } from "~dm-types/events/AbstractEvent";
import { user } from "~prisma-clients/extended/dm.extends";
import { EventReturnType } from "~socket.io-services/types";

import { dmSocketInjectionKey } from "../composables/useDmSocket";

type SimpleUser = Pick<user, "id" | "username">;

export const users = defineStore("users", () => {
  const {
    events: { services: eventsServices },
    globalStats: { services: globalStatsServices },
  } = injectLocal(dmSocketInjectionKey)!;
  const count = ref(
      null as EventReturnType<GlobalStatsServices["getUserCount"]> | null,
    ),
    stats = ref(
      {} as EventReturnType<
        GlobalStatsServices["getUsersPointsAndStats"]
      >["stats"],
    ),
    points = ref(
      {} as EventReturnType<
        GlobalStatsServices["getUsersPointsAndStats"]
      >["points"],
    ),
    events = ref([] as AbstractEvent[]),
    bookcaseContributors = ref(null as BookcaseContributor[] | null),
    allUsers = ref<SimpleUser[] | null>(null),
    fetchAllUsers = async () => {
      if (!allUsers.value) {
        allUsers.value = await globalStatsServices.getUserList();
      }
    },
    fetchCount = async () => {
      if (count.value === null) {
        count.value = await globalStatsServices.getUserCount();
      }
    },
    fetchStats = async (userIds: number[] /*, clearCacheEntry = true*/) => {
      const missingUserIds = [...new Set(userIds)].filter(
        (userId) =>
          !Object.keys(points.value)
            .map((userIdHavingPoints) => parseInt(userIdHavingPoints))
            .includes(userId),
      );
      if (!missingUserIds.length) return;

      const data =
        await globalStatsServices.getUsersPointsAndStats(missingUserIds);
      points.value = {
        ...points.value,
        ...data.points,
      };
      stats.value = {
        ...stats.value,
        ...data.stats,
      };
    },
    fetchBookcaseContributors = async () => {
      if (!bookcaseContributors.value) {
        bookcaseContributors.value =
          await globalStatsServices.getBookcaseContributors();
      }
    },
    fetchEvents = async () => {
      events.value = (await eventsServices.getEvents())
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          Math.sign(timestamp2 - timestamp1),
        )
        .filter((_, index) => index < 50);
    };

  return {
    allUsers,
    fetchAllUsers,
    count,
    stats,
    points,
    events,
    bookcaseContributors,
    fetchCount,
    fetchStats,
    fetchBookcaseContributors,
    fetchEvents,
  };
});
