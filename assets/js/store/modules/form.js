export default {
  namespaced: true,
  state: () => ({
    errors: {}
  }),

  mutations: {
    addErrors(state, errors) {
      state.errors = {...state.errors, ...errors}
    },
    clearErrors(state) {
      state.errors = {}
    }
  },

  getters: {
    hasErrors: ({ errors }) => Object.keys(errors).length
  }
}