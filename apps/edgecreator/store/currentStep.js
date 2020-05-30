export const state = () => ({
  stepNumber: null
})

export const mutations = {
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  }
}
