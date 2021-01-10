import axios from "axios";
import { userCountCache } from "../../util/cache";

const api = axios.create({
  adapter: userCountCache.adapter,
})

export default {
  namespaced: true,
  state: () => ({
    count: null,
    stats: {},
    points: {},
    bookcaseContributors: null
  }),

  mutations: {
    setCount(state, count) {
      state.count = count
    },
    setPoints(state, points) {
      state.points = {...state.points, ...points}
    },
    setStats(state, stats) {
      state.stats = {...state.stats, ...stats}
    },
    setBookcaseContributors(state, bookcaseContributors) {
      state.bookcaseContributors = bookcaseContributors
    }
  },

  actions: {
    async fetchCount({state, commit}) {
      if (!state.count) {
        commit("setCount", (await api.get("/global-stats/user/count")).data.count)
      }
    },
    async fetchStats({state, commit}, userIds) {
      userIds = [...new Set(userIds)]
      const missingUserIds = userIds.filter(userId => !(Object.keys(state.points)).includes(userId))
      if (!missingUserIds.length) {
        return
      }
      const url = `/global-stats/user/${missingUserIds.join(',')}`

      const data = (await axios.get(url)).data;
      commit('setPoints', data.points.reduce((acc, data) =>
        ({
          ...acc,
          [data.ID_User]: {
            ...acc[data.ID_User] || {},
            [data.contribution]: data.points_total
          }
        }), {}))
      commit('setStats', data.stats.reduce(
        (acc, data) => ({...acc, [data.userId]: data}),
        {}
      ))
    },

    async fetchBookcaseContributors({state, commit}) {
      if (!state.bookcaseContributors) {
        commit("setBookcaseContributors", (await axios.get(`/global-stats/bookcase/contributors`)).data)
      }
    }
  }
}
