export const state = () => ({
  issuenumber: null,
  stepNumber: null,
  stepOptions: {},
})

export const mutations = {
  setIssuenumber(state, issuenumber) {
    state.issuenumber = issuenumber
  },
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  },
  setStepOptions(state, stepOptions) {
    state.stepOptions = stepOptions
  },
}
