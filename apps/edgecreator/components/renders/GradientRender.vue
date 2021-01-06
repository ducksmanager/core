<template>
  <g>
    <defs>
      <linearGradient
        :id="gradientId"
        x1="0%"
        y1="0%"
        :x2="options.direction === 'Vertical' ? '0%' : '100%'"
        :y2="options.direction === 'Vertical' ? '100%' : '0%'"
      >
        <stop offset="0%" :style="{ 'stop-color': options.colorStart, 'stop-opacity': 1 }" />
        <stop offset="100%" :style="{ 'stop-color': options.colorEnd, 'stop-opacity': 1 }" />
      </linearGradient>
    </defs>
    <rect ref="rect" v-bind="attributes" :fill="`url(#${gradientId})`">
      <metadata>{{ options }}</metadata>
    </rect>
  </g>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  props: {
    options: {
      type: Object,
      default: () => ({
        x: 3,
        y: 3,
        width: 10,
        height: 80,
        colorStart: '#D01721',
        colorEnd: '#0000FF',
        direction: 'Vertical',
      }),
    },
  },

  data: () => ({
    attributeKeys: ['x', 'y', 'width', 'height'],
  }),

  computed: {
    gradientId() {
      return Object.values(this.options).join('-')
    },
  },

  mounted() {
    this.enableDragResize(this.$refs.rect)
  },
}
</script>

<style scoped></style>
