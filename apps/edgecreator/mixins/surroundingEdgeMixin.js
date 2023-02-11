import { mapState } from 'pinia'
import { ui as uiStore } from '../stores/ui'
import { main } from '~/stores/main'

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
