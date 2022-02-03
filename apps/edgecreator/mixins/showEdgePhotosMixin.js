import { mapWritableState } from 'pinia'
import { ui } from '~/stores/ui'

export default {
  computed: {
    ...mapWritableState(ui, ['showEdgePhotos']),
  },
}
