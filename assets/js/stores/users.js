import { cachedUserApi as api } from "../util/cache";
import { defineStore } from "pinia";

export const users = defineStore('users', {
  state: () => ({
    count: null,
    stats: {},
    points: {},
    events: [],
    bookcaseContributors: null
  }),

  actions: {
    async fetchCount() {
      if (!this.count) {
        this.count = (await api.get("/global-stats/user/count")).data.count
      }
    },
    async fetchStats(userIds, clearCacheEntry = true) {
      const missingUserIds = [...new Set(userIds)]
        .filter(userId => !(Object.keys(this.points)).includes(userId))
      if (!missingUserIds.length) {
        return
      }
      const url = `/global-stats/user/${missingUserIds.sort((a, b) => a < b ? -1 : 1).join(',')}`

      const data = (await api.get(url, {
        cache: !clearCacheEntry})).data;
      this.points = {
        ...this.points, ...data.points.reduce((acc, data) =>
          ({
            ...acc,
            [data.ID_User]: {
              ...acc[data.ID_User] || {},
              [data.contribution]: data.points_total
            }
          }), {})
      }
      this.stats = {
        ...this.stats, ...data.stats.reduce(
          (acc, data) => ({...acc, [data.userId]: data}),
          {}
        )
      }
    },

    async fetchBookcaseContributors() {
      if (!this.bookcaseContributors) {
        this.bookcaseContributors = (await axios.get(`/global-stats/bookcase/contributors`)).data
      }
    },

    async fetchEvents(clearCacheEntry = true) {
      const {data, cached} = await api.get("/events", {
        cache: !clearCacheEntry
      })
      this.events = (data || []).map(event => {
        if (event.exampleIssue) {
          const [publicationCode, issueNumber] = event.exampleIssue.split(/\/(?=[^/]+$)/);
          event = { ...event, publicationCode, issueNumber };
        }
        if (event.users) {
          event = { ...event, users: event.users.split(",").map(userId => parseInt(userId)) };
        }
        if (event.userId) {
          event.userId = parseInt(event.userId);
        }
        if (event.edges) {
          event.edges = JSON.parse(event.edges);
        }

        return {
          ...event,
          numberOfIssues: event.numberOfIssues && parseInt(event.numberOfIssues),
          timestamp: parseInt(event.timestamp)
        };
      }).sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) => Math.sign(timestamp2 - timestamp1))
        .filter((_, index) => index < 50);

      return !cached;
    }
  }
})
