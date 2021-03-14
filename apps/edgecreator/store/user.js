export const state = () => ({
  allUsers: null,
})

export const mutations = {
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
