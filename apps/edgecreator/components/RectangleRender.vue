<template>
  <rect ref="rect" v-bind="options" @click="setStepNumber(stepNumber)">
    <metadata>{{ options }}</metadata>
  </rect>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

const interact = require('interact.js')

export default {
  mixins: [stepOptionsMixin],

  methods: {
    onOptionsSet() {
      const vm = this
      interact(this.$refs.rect)
        .draggable({
          onmove: (event) => {
            vm.options.x += event.dx / vm.zoom
            vm.options.y += event.dy / vm.zoom
          }
        })
        .resizable({
          edges: { right: true, bottom: true }
        })
        .on('resizemove', (event) => {
          vm.options.width = event.rect.width / vm.zoom
          vm.options.height = event.rect.height / vm.zoom
        })
    },
    getOptionsFromSvgGroup() {
      const rect = this.svgGroup.childNodes.find(
        (node) => node.nodeName === 'rect'
      )
      return {
        x: parseFloat(rect.getAttribute('x')),
        y: parseFloat(rect.getAttribute('y')),
        width: parseFloat(rect.getAttribute('width')),
        height: parseFloat(rect.getAttribute('height')),
        fill: rect.getAttribute('fill'),
        stroke: rect.getAttribute('stroke')
      }
    },
    getOptionsFromDb() {
      const filled = this.dbOptions.Rempli === 'Oui'
      return {
        x: parseFloat(this.dbOptions.Pos_x_debut),
        y: parseFloat(this.dbOptions.Pos_y_debut),
        width: parseFloat(
          this.dbOptions.Pos_x_fin - this.dbOptions.Pos_x_debut
        ),
        height: parseFloat(
          this.dbOptions.Pos_y_fin - this.dbOptions.Pos_y_debut
        ),
        fill: filled ? `#${this.dbOptions.Couleur}` : '',
        stroke: filled ? '' : `#${this.dbOptions.Couleur}`
      }
    }
  }
}
</script>

<style scoped></style>
