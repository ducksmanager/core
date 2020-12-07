export default {
  computed: {
    showEdgePhotos: {
      get() {
        return this.$store.state.ui.showEdgePhotos
      },
      set(value) {
        this.$store.commit('ui/setShowEdgePhotos', value)
      },
    },
  },
}
