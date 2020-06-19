export const state = () => ({
  issuenumber: null,
  stepNumber: null
})

export const mutations = {
  setIssuenumber(state, issuenumber) {
    state.issuenumber = issuenumber
  },
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  }
}
