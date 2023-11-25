import { AxiosInstance } from "axios";
import { buildWebStorage } from "axios-cache-interceptor";

import { GET__global_stats__user__$userIds } from "~api-routes/index";
import { addUrlParamsRequestInterceptor, call } from "~axios-helper";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { AbstractEvent } from "~dm-types/events/AbstractEvent";

import { createCachedUserApi } from "../api";

let api: AxiosInstance;
export const users = defineStore("users", () => {
  const count = ref(null as number | null),
    stats = ref({} as GET__global_stats__user__$userIds["resBody"]["stats"]),
    points = ref({} as GET__global_stats__user__$userIds["resBody"]["points"]),
    events = ref([] as AbstractEvent[]),
    bookcaseContributors = ref(null as BookcaseContributor[] | null),
    fetchCount = async () => {
      if (count.value === null) {
        count.value = (
          await call(api, new GET__global_stats__user__count())
        ).data!.count;
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

      const data = (
        await call(
          api,
          new GET__global_stats__user__$userIds({
            ...(clearCacheEntry ? {} : { cache: false }),
            params: {
              userIds: missingUserIds
                .sort((a, b) => Math.sign(a - b))
                .join(","),
            },
          }),
        )
      ).data;
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
        bookcaseContributors.value = (
          await call(api, new GET__global_stats__bookcase__contributors())
        ).data;
      }
    },
    fetchEvents = async () => {
      events.value = (
        await call(
          createCachedUserApi(
            buildWebStorage(sessionStorage),
            import.meta.env.VITE_GATEWAY_URL,
          ),
          new GET__events(),
        )
      ).data
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          Math.sign(timestamp2 - timestamp1),
        )
        .filter((_, index) => index < 50);
    };

  return {
    setApi: (params: { api: typeof api }) => {
      api = addUrlParamsRequestInterceptor(params.api);
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
