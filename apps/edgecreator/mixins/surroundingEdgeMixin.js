export default {
  computed: {
    showPreviousEdge: {
      get() {
        return this.$store.state.ui.showPreviousEdge && this.$store.state.edgesBefore.length
      },
      set(value) {
        this.$store.commit('ui/setShowPreviousEdge', value)
      },
    },
    showNextEdge: {
      get() {
        return this.$store.state.ui.showNextEdge && this.$store.state.edgesAfter.length
      },
      set(value) {
        this.$store.commit('ui/setShowNextEdge', value)
      },
    },
  },
}
