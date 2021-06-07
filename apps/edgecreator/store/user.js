export const state = () => ({
  allUsers: null,
  username: null,
  userPhotographerPoints: null,
})

export const mutations = {
  setAllUsers(state, allUsers) {
    state.allUsers = allUsers
  },
  setUsername(state, username) {
    state.username = username
  },
  setUserPhotographerPoints(state, userPhotographerPoints) {
    state.userPhotographerPoints = userPhotographerPoints
  },
}

export const actions = {
  async fetchAllUsers({ commit, state }) {
    if (!state.allUsers) {
      commit('setAllUsers', (await this.$axios.$get(`/api/ducksmanager/users`)).users)
    }
  },

  async fetchUserPoints({ commit }) {
    const userIdData = await this.$axios.$get(`/user-id`)
    const userData = await this.$axios.$get(`/api/global-stats/user/${userIdData.id}`)
    commit(
      'setUserPhotographerPoints',
      userData.points.find(({ contribution }) => contribution === 'Photographe').points_total
    )
  },
}
