export const state = () => ({
  issuenumber: null,
  hoveredStep: null,
  stepNumber: null,
  stepOptions: {}
})

export const mutations = {
  setIssuenumber(state, issuenumber) {
    state.issuenumber = issuenumber
  },
  setHoveredStep(state, hoveredStep) {
    state.hoveredStep = hoveredStep
  },
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  },
  setStepOptions(state, stepOptions) {
    state.stepOptions = stepOptions
  }
}
