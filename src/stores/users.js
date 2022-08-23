import axios from "axios";
import { defineStore } from "pinia";

import { cachedUserApi as userApi } from "~/util/api";

export const users = defineStore("users", {
  state: () => ({
    count: null,
    stats: {},
    points: {},
    events: [],
    bookcaseContributors: null,
  }),

  actions: {
    async fetchCount() {
      if (!this.count)
        this.count = (await userApi.get("/global-stats/user/count")).data.count;
    },
    async fetchStats(userIds, clearCacheEntry = true) {
      const points = this.points;
      const missingUserIds = [...new Set(userIds)].filter(
        (userId) => !Object.keys(points).includes(userId)
      );
      if (!missingUserIds.length) return;

      const url = `/global-stats/user/${missingUserIds
        .sort((a, b) => Math.sign(a - b))
        .join(",")}`;

      const data = (await userApi.get(url, { cache: !clearCacheEntry })).data;
      this.points = {
        ...this.points,
        ...data.points.reduce(
          (acc, data) => ({
            ...acc,
            [data.userId]: {
              ...(acc[data.userId] || {}),
              [data.contribution]: data.totalPoints,
            },
          }),
          {}
        ),
      };
      this.stats = {
        ...this.stats,
        ...data.stats.reduce(
          (acc, data) => ({ ...acc, [data.userId]: data }),
          {}
        ),
      };
    },

    async fetchBookcaseContributors() {
      if (!this.bookcaseContributors) {
        this.bookcaseContributors = (
          await axios.get("/global-stats/bookcase/contributors")
        ).data;
      }
    },

    async fetchEvents(clearCacheEntry = true) {
      const { data, cached } = await userApi.get("/events", {
        cache: !clearCacheEntry,
      });
      this.events = (data || [])
        .map((event) => {
          if (event.exampleIssue) {
            const [publicationCode, issueNumber] =
              event.exampleIssue.split(/\/(?=[^/]+$)/);
            event = { ...event, publicationCode, issueNumber };
          }
          if (event.users) {
            event = {
              ...event,
              users: event.users.split(",").map((userId) => parseInt(userId)),
            };
          }
          if (event.userId) event.userId = parseInt(event.userId);

          if (event.edges) event.edges = JSON.parse(event.edges);

          return {
            ...event,
            numberOfIssues:
              event.numberOfIssues && parseInt(event.numberOfIssues),
            timestamp: parseInt(event.timestamp),
          };
        })
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          Math.sign(timestamp2 - timestamp1)
        )
        .filter((_, index) => index < 50);

      return !cached;
    },
  },
});
