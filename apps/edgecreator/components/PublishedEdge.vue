<template
  ><b-img
    :height="(naturalHeight * zoom) / 1.5"
    :src="getEdgeUrl(issuenumber)"
    @load="naturalHeight = $event.currentTarget.naturalHeight"
/></template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'PublishedEdge',
  props: {
    issuenumber: { type: String, required: true }
  },
  data() {
    return {
      naturalHeight: 0
    }
  },
  computed: {
    ...mapState(['edge', 'zoom'])
  },
  methods: {
    getEdgeUrl() {
      return `${process.env.EDGES_URL}/${this.edge.country}/gen/${this.edge.magazine}.${this.issuenumber}.png`
    }
  }
}
</script>

<style scoped></style>
