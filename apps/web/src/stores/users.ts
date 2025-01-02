import type { ClientEvents as GlobalStatsServices } from "~dm-services/global-stats";
import type { BookcaseContributor } from "~dm-types/BookcaseContributor";
import type { AbstractEvent } from "~dm-types/events/AbstractEvent";
import type { user } from "~prisma-schemas/schemas/dm";

import { socketInjectionKey } from "../composables/useDmSocket";
import { EventOutput, SuccessfulEventOutput } from "~socket.io-services/index";

type SimpleUser = Pick<user, "id" | "username">;

export const users = defineStore("users", () => {
  const {
    events: { services: eventsServices },
    globalStats: { services: globalStatsServices },
  } = inject(socketInjectionKey)!;
  const count = ref<EventOutput<GlobalStatsServices, "getUserCount"> | null>(
      null,
    ),
    stats = shallowRef<
      SuccessfulEventOutput<
        GlobalStatsServices,
        "getUsersPointsAndStats"
      >["stats"]
    >({}),
    points = shallowRef<
      SuccessfulEventOutput<
        GlobalStatsServices,
        "getUsersPointsAndStats"
      >["points"]
    >({}),
    events = shallowRef<AbstractEvent[]>([]),
    bookcaseContributors = shallowRef<BookcaseContributor[]>(),
    allUsers = shallowRef<SimpleUser[]>(),
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
    fetchStats = async (userIds: number[], force = false) => {
      let missingUserIds;
      if (force) {
        missingUserIds = userIds;
      } else {
        missingUserIds = [...new Set(userIds)].filter(
          (userId) =>
            !Object.keys(points.value)
              .map((userIdHavingPoints) => parseInt(userIdHavingPoints))
              .includes(userId),
        );
      }
      if (!missingUserIds.length) return;

      const data =
        await globalStatsServices.getUsersPointsAndStats(missingUserIds);
      if (!("error" in data)) {
        points.value = {
          ...points.value,
          ...data.points,
        };
        stats.value = {
          ...stats.value,
          ...data.stats,
        };
      }
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
