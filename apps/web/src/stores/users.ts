import { AxiosInstance } from "axios";
import { Socket } from "socket.io-client";

import { Services as EventsServices } from "~api/services/events/types";
import { Services as GlobalStatsServices } from "~api/services/global-stats/types";
import { EventReturnType } from "~api/services/types";
import { addUrlParamsRequestInterceptor } from "~axios-helper";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { AbstractEvent } from "~dm-types/events/AbstractEvent";

let api: AxiosInstance, socket: Socket<EventsServices & GlobalStatsServices>;
export const users = defineStore("users", () => {
  const count = ref(null as number | null),
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
        count.value = (await socket.emitWithAck("getUserCount")).count;
      }
    },
    fetchStats = async (userIds: number[], clearCacheEntry = true) => {
      const missingUserIds = [...new Set(userIds)].filter(
        (userId) =>
          !Object.keys(points.value)
            .map((userIdHavingPoints) => parseInt(userIdHavingPoints))
            .includes(userId),
      );
      if (!missingUserIds.length) return;

      const data = await socket.emitWithAck(
        "getUsersPointsAndStats",
        missingUserIds,
      );
      points.value = {
        ...points.value,
        ...data.points,
      };
      stats.value = {
        ...stats.value,
        ...data.stats.reduce(
          (acc, data) => ({
            ...acc,
            [data.userId]: data,
          }),
          {},
        ),
      };
    },
    fetchBookcaseContributors = async () => {
      if (!bookcaseContributors.value) {
        bookcaseContributors.value = await socket.emitWithAck(
          "getBookcaseContributors",
        );
      }
    },
    fetchEvents = async () => {
      events.value = (await socket.emitWithAck("getEvents"))
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          Math.sign(timestamp2 - timestamp1),
        )
        .filter((_, index) => index < 50);
    };

  return {
    setApi: (params: { api: typeof api }) => {
      api = addUrlParamsRequestInterceptor(params.api);
    },
    getSocket: () => socket,
    setSocket: (params: { socket: typeof socket }) => {
      socket = params.socket;
    },
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
