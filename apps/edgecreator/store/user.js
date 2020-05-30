export const state = () => ({
  username: null
})

export const mutations = {
  setUsername(state, username) {
    state.username = username
  }
}
