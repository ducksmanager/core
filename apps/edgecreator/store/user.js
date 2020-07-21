export const state = () => ({
  username: null,
  allUsers: [],
})

export const mutations = {
  setUsername(state, username) {
    state.username = username
  },
  setAllUsers(state, allUsers) {
    state.allUsers = allUsers
  },
}
