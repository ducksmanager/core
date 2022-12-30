import axios from "axios";
import { defineStore } from "pinia";

import { cachedUserApi as userApi } from "~/util/api";
import { AbstractEvent } from "~types/events/AbstractEvent";
import { BookstoreCreationEvent } from "~types/events/BookstoreCreationEvent";
import { CollectionSubscriptionAdditionEvent } from "~types/events/CollectionSubscriptionAdditionEvent";
import { CollectionUpdateEvent } from "~types/events/CollectionUpdateEvent";
import { EdgeCreationEvent } from "~types/events/EdgeCreationEvent";
import { SignupEvent } from "~types/events/SignupEvent";
import routes from "~types/routes";
import { SimpleUserWithQuickStats } from "~types/SimpleUserWithQuickStats";

export const users = defineStore("users", {
  state: () => ({
    count: null as number | null,
    stats: {} as { [userId: number]: SimpleUserWithQuickStats },
    points: {} as { [userId: number]: { [contribution: string]: number } },
    events: [] as AbstractEvent[],
    bookcaseContributors: null as
      | { userId: number; name: string; text: string }[]
      | null,
  }),

  actions: {
    async fetchCount() {
      if (!this.count)
        this.count = (
          await routes["GET /global-stats/user/count"](axios)
        ).data.count;
    },
    async fetchStats(userIds: number[], clearCacheEntry = true) {
      const points = this.points;
      const missingUserIds = [...new Set(userIds)].filter(
        (userId) =>
          !Object.keys(points)
            .map((userIdHavingPoints) => parseInt(userIdHavingPoints))
            .includes(userId)
      );
      if (!missingUserIds.length) return;

      const data = (
        await routes["GET /global-stats/user/:userIds"](axios, {
          ...(clearCacheEntry ? {} : { cache: false }),
          urlParams: {
            userIds: missingUserIds.sort((a, b) => Math.sign(a - b)).join(","),
          },
        })
      ).data;
      this.points = {
        ...this.points,
        ...data.points,
      };
      this.stats = {
        ...this.stats,
        ...data.stats.reduce(
          (acc, data) => ({
            ...acc,
            [data.userId]: data,
          }),
          {}
        ),
      };
    },

    async fetchBookcaseContributors() {
      if (!this.bookcaseContributors) {
        this.bookcaseContributors = (
          await routes["GET /global-stats/bookcase/contributors"](axios)
        ).data as { userId: number; name: string; text: string }[];
      }
    },

    async fetchEvents(clearCacheEntry = true) {
      const { data, cached } = await userApi.get(
        "/events",
        clearCacheEntry ? {} : { cache: false }
      );
      this.events = (
        data as (
          | BookstoreCreationEvent
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
    },
  },
});
