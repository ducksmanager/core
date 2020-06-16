import Vue from 'vue'

export const state = () => ({
  stepNumber: null,
  stepOptions: {}
})

export const mutations = {
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  },
  setStepOption(state, { key, value }) {
    Vue.set(state.stepOptions, key, value)
  }
}
