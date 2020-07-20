export const state = () => ({
  showIssueNumbers: true,
  showPreviousEdge: true,
  showNextEdge: true,
  showEdgePhoto: false,
  locked: false,
})

export const mutations = {
  setShowIssueNumbers(state, showIssueNumbers) {
    state.showIssueNumbers = showIssueNumbers
  },
  setShowPreviousEdge(state, showPreviousEdge) {
    state.showPreviousEdge = showPreviousEdge
  },
  setShowNextEdge(state, showNextEdge) {
    state.showNextEdge = showNextEdge
  },
  setShowEdgePhoto(state, showEdgePhoto) {
    state.showEdgePhoto = showEdgePhoto
  },
  setLocked(state, locked) {
    state.locked = locked
  },
}
