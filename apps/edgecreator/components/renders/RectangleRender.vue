<template>
  <rect ref="rect" v-bind="options">
    <metadata>{{ options }}</metadata>
  </rect>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  props: {
    options: {
      type: Object,
      default: () => ({
        x: 5,
        y: 5,
        width: 15,
        height: 15,
        fill: '#ff0000',
        stroke: 'transparent',
      }),
    },
  },

  data: () => ({
    attributeKeys: ['x', 'y', 'width', 'height', 'fill', 'stroke'],
  }),

  mounted() {
    this.enableDragResize(this.$refs.rect)
  },
}
</script>

<style scoped></style>
