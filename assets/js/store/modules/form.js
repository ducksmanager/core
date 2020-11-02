export default {
  namespaced: true,
  state: () => ({
    errors: {}
  }),

  mutations: {
    setErrors(state, errors) {
      state.errors = {...state.errors, ...errors}
    }
  }
}