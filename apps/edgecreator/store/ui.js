export const state = () => ({
  zoom: 1.5,
  showIssueNumbers: true,
  showEdgeOverflow: true,
  showPreviousEdge: true,
  showNextEdge: true,
  showEdgePhotos: true,
  locked: false,
  colorPickerOption: null,
  positionInCanvas: null,
})

export const mutations = {
  setZoom(state, zoom) {
    state.zoom = zoom
  },
  setShowIssueNumbers(state, showIssueNumbers) {
    state.showIssueNumbers = showIssueNumbers
  },
  setShowEdgeOverflow(state, showEdgeOverflow) {
    state.showEdgeOverflow = showEdgeOverflow
  },
  setShowPreviousEdge(state, showPreviousEdge) {
    state.showPreviousEdge = showPreviousEdge
  },
  setShowNextEdge(state, showNextEdge) {
    state.showNextEdge = showNextEdge
  },
  setShowEdgePhotos(state, showEdgePhotos) {
    state.showEdgePhotos = showEdgePhotos
  },
  setLocked(state, locked) {
    state.locked = locked
  },
  setColorPickerOption(state, colorPickerOption) {
    state.colorPickerOption = colorPickerOption
  },
  setPositionInCanvas(state, positionInCanvas) {
    state.positionInCanvas = positionInCanvas
  },
}
