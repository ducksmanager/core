import axios from "axios";
import { userCountCache } from "../util/cache";
import { defineStore } from "pinia";

const api = axios.create({
  adapter: userCountCache.adapter,
})

export const users = defineStore('users', {
  state: () => ({
    count: null,
    stats: {},
    points: {},
    bookcaseContributors: null
  }),

  actions: {
    async fetchCount() {
      if (!this.count) {
        this.count = (await api.get("/global-stats/user/count")).data.count
      }
    },
    async fetchStats(userIds) {
      userIds = [...new Set(userIds)]
      const missingUserIds = userIds.filter(userId => !(Object.keys(this.points)).includes(userId))
      if (!missingUserIds.length) {
        return
      }
      const url = `/global-stats/user/${missingUserIds.join(',')}`

      const data = (await axios.get(url)).data;
      this.points = data.points.reduce((acc, data) =>
        ({
          ...acc,
          [data.ID_User]: {
            ...acc[data.ID_User] || {},
            [data.contribution]: data.points_total
          }
        }), {})
      this.stats = data.stats.reduce(
        (acc, data) => ({...acc, [data.userId]: data}),
        {}
      )
    },

    async fetchBookcaseContributors() {
      if (!this.bookcaseContributors) {
        this.bookcaseContributors = (await axios.get(`/global-stats/bookcase/contributors`)).data
      }
    }
  }
})
