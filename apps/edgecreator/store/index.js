export const state = () => ({
  edge: null,
  steps: [],
  galleryItems: [],
  zoom: 1.5,
  width: 15,
  height: 200
})

export const mutations = {
  setEdge(state, edge) {
    state.edge = { ...edge, country: edge.pays }
  },
  setSteps(state, steps) {
    state.steps = steps
  },
  setZoom(state, zoom) {
    state.zoom = zoom
  },
  setDimensions(state, { width, height }) {
    state.width = parseInt(width)
    state.height = parseInt(height)
  },
  setGalleryItems(state, galleryItems) {
    state.galleryItems = galleryItems
  }
}
