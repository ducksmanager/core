export default {
  computed: {
    showPreviousEdge: {
      get() {
        return (
          this.$store.state.ui.showPreviousEdge &&
          this.$store.state.edgesBefore.length > 0
        )
      },
      set(value) {
        this.$store.commit('ui/setShowPreviousEdge', value)
      },
    },
    showNextEdge: {
      get() {
        return (
          this.$store.state.ui.showNextEdge &&
          this.$store.state.edgesAfter.length > 0
        )
      },
      set(value) {
        this.$store.commit('ui/setShowNextEdge', value)
      },
    },
  },
}
