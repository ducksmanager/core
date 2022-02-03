<template>
  <b-img
    :height="(naturalHeight * zoom) / 1.5"
    :src="getEdgeUrl(issuenumber)"
    @load="
      naturalHeight = $event.currentTarget.naturalHeight
      $emit('load')
    "
    @error="$emit('error')"
  />
</template>

<script>
import { mapState } from 'pinia'
import { main } from '~/stores/main'
import { ui } from '~/stores/ui'

export default {
  name: 'PublishedEdge',
  props: {
    issuenumber: { type: String, required: true },
  },
  data() {
    return {
      naturalHeight: 0,
    }
  },
  computed: {
    ...mapState(main, ['country', 'magazine']),
    ...mapState(ui, ['zoom']),
  },
  methods: {
    getEdgeUrl() {
      return `/edges/${this.country}/gen/${this.magazine}.${this.issuenumber}.png`
    },
  },
}
</script>

<style scoped></style>
