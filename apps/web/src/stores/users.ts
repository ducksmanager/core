import {
  GET__global_stats__bookcase__contributors,
  GET__global_stats__user__$userIds,
  GET__global_stats__user__count,
} from "api-routes";
import axios from "axios";
import { defineStore } from "pinia";
import { BookcaseContributor } from "types/BookcaseContributor";
import { AbstractEvent } from "types/events/AbstractEvent";
import { BookstoreCommentEvent } from "types/events/BookstoreCommentEvent";
import { CollectionSubscriptionAdditionEvent } from "types/events/CollectionSubscriptionAdditionEvent";
import { CollectionUpdateEvent } from "types/events/CollectionUpdateEvent";
import { EdgeCreationEvent } from "types/events/EdgeCreationEvent";
import { SignupEvent } from "types/events/SignupEvent";

import { cachedUserApi as userApi } from "~/util/api";
import { call } from "~/util/axios";

export const users = defineStore("users", () => {
  const count = ref(null as number | null),
    stats = ref({} as GET__global_stats__user__$userIds["resBody"]["stats"]),
    points = ref({} as GET__global_stats__user__$userIds["resBody"]["points"]),
    events = ref([] as AbstractEvent[]),
    bookcaseContributors = ref(null as BookcaseContributor[] | null),
    fetchCount = async () => {
      if (count.value === null) {
        count.value = (
          await call(axios, new GET__global_stats__user__count())
        ).data!.count;
      }
    },
    fetchStats = async (userIds: number[], clearCacheEntry = true) => {
      const missingUserIds = [...new Set(userIds)].filter(
        (userId) =>
          !Object.keys(points.value)
            .map((userIdHavingPoints) => parseInt(userIdHavingPoints))
            .includes(userId)
      );
      if (!missingUserIds.length) return;

      const data = (
        await call(
          axios,
          new GET__global_stats__user__$userIds({
            ...(clearCacheEntry ? {} : { cache: false }),
            params: {
              userIds: missingUserIds
                .sort((a, b) => Math.sign(a - b))
                .join(","),
            },
          })
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
          {}
        ),
      };
    },
    fetchBookcaseContributors = async () => {
      if (!bookcaseContributors.value) {
        bookcaseContributors.value = (
          await call(axios, new GET__global_stats__bookcase__contributors())
        ).data;
      }
    },
    fetchEvents = async (clearCacheEntry = true) => {
      const { data, cached } = await userApi.get(
        "/events",
        clearCacheEntry ? {} : { cache: false }
      );
      events.value = (
        data as (
          | BookstoreCommentEvent
          | CollectionSubscriptionAdditionEvent
          | CollectionUpdateEvent
          | EdgeCreationEvent
          | SignupEvent
        )[]
      )
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          Math.sign(timestamp2 - timestamp1)
        )
        .filter((_, index) => index < 50);

      return !cached;
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
