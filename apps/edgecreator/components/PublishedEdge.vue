<template
  ><b-img
    :height="(naturalHeight * zoom) / 1.5"
    :src="getEdgeUrl(issueNumber)"
    @load="naturalHeight = $event.currentTarget.naturalHeight"
/></template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'PublishedEdge',
  props: {
    issueNumber: { type: String, required: true }
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
      return `${process.env.EDGES_URL}/${this.edge.country}/gen/${this.edge.magazine}.${this.issueNumber}.png`
    }
  }
}
</script>

<style scoped></style>
