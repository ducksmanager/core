<template>
  <rect
    ref="rect"
    v-bind="options"
    x="0"
    y="0"
    :width="width"
    :height="height"
    @click="setStepNumber(stepNumber)"
  >
    <metadata>{{ options }}</metadata>
  </rect>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  data() {
    return {
      options: {
        fill: '#ff0000'
      }
    }
  },

  methods: {
    onOptionsSet() {},
    getOptionsFromSvgGroup() {
      const rect = Object.values(this.svgGroup.childNodes).find(
        (node) => node.nodeName === 'rect'
      )
      return {
        fill: rect.getAttribute('fill')
      }
    },
    async getOptionsFromDb() {
      if (parseFloat(this.dbOptions.Pos_x) !== 0) {
        console.error(
          `Step ${this.stepNumber}: Pos_x !== 0, this is not supported`
        )
      }
      if (parseFloat(this.dbOptions.Pos_y) !== 0) {
        console.error(
          `Step ${this.stepNumber}: Pos_y !== 0, this is not supported`
        )
      }
      return {
        fill: `#${this.dbOptions.Couleur}`
      }
    }
  }
}
</script>

<style scoped></style>
