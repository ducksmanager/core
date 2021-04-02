export const state = () => ({
  issuenumbers: [],
  stepNumber: 0,
})

export const mutations = {
  addIssuenumber(state, issuenumber) {
    state.issuenumbers = [...new Set(state.issuenumbers.concat(issuenumber))].sort()
  },
  addIssuenumbers(state, issuenumbers) {
    state.issuenumbers = [...new Set([...state.issuenumbers, ...issuenumbers])].sort()
  },
  replaceIssuenumber(state, issuenumber) {
    state.issuenumbers = [issuenumber]
  },
  toggleIssuenumber(state, issuenumber) {
    if (state.issuenumbers.includes(issuenumber)) {
      if (state.issuenumbers.length > 1) {
        state.issuenumbers.splice(state.issuenumbers.indexOf(issuenumber), 1)
      }
    } else {
      state.issuenumbers = [...new Set(state.issuenumbers.concat(issuenumber))].sort()
    }
  },
  setStepNumber(state, stepNumber) {
    state.stepNumber = stepNumber
  },
}
