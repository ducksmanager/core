import { eventsServices, globalStatsServices } from "~/composables/useSocket";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { AbstractEvent } from "~dm-types/events/AbstractEvent";
import GlobalStatsServices from "~services/global-stats/types";
import { EventReturnType } from "~services/types";

export const users = defineStore("users", () => {
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
