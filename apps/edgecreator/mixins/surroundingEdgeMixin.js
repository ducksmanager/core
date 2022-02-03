import { mapState } from 'pinia'
import { main } from '~/stores/main'

const { ui: uiStore } = require('../stores/ui')

let ui

export default {
  computed: {
    ...mapState(main, ['edgesBefore', 'edgesAfter']),
    showPreviousEdge: {
      get() {
        return ui.showPreviousEdge && this.edgesBefore.length > 0
      },
      set(value) {
        ui.$patch({ showPreviousEdge: value })
      },
    },
    showNextEdge: {
      get() {
        return ui.showNextEdge && this.edgesAfter.length > 0
      },
      set(value) {
        ui.$patch({ showNextEdge: value })
      },
    },
  },
  mounted() {
    ui = uiStore()
  },
}
