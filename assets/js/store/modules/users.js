import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    stats: {},
    points: {}
  }),

  mutations: {
    setPoints(state, points) {
      state.points = {...state.points, ...points}
    },
    setStats(state, stats) {
      state.stats = {...state.stats, ...stats}
    }
  },

  actions: {
    async fetchStats({state, commit}, userIds) {
      const missingUserIds = userIds.filter(userId => !(Object.keys(state.points)).includes(userId))
      if (!missingUserIds.length) {
        return
      }
      const url = `/stats/user/${missingUserIds.join(',')}`

      const data = (await axios.get(url)).data;
      commit('setPoints', data.points.reduce((acc, data) =>
        ({
          ...acc,
          [data.ID_User]: {
            ...acc[data.ID_User] || {},
            [data.contribution]: data.points_total
          }
        }), {}))
      commit('setStats', data.stats.map((
        {country_number: numberOfCountries, publication_number: numberOfPublications, issue_number: numberOfIssues, ID: userId}) => ({
          numberOfCountries, numberOfPublications, numberOfIssues, userId
        })
      ).reduce((acc, data) => ({...acc, [data.userId]: data}), {}))
    }
  }
}