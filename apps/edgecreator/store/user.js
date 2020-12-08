export const state = () => ({
  username: null,
  allUsers: null,
})

export const mutations = {
  setUsername(state, username) {
    state.username = username
  },
  setAllUsers(state, allUsers) {
    state.allUsers = allUsers
  },
}

export const actions = {
  async fetchAllUsers({ commit, state }) {
    if (!state.allUsers) {
      commit('setAllUsers', (await this.$axios.$get(`/api/ducksmanager/users`)).users)
    }
  },
}
