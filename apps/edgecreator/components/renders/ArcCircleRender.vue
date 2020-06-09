<template>
  <ellipse ref="rect" v-bind="options" @click="setStepNumber(stepNumber)">
    <metadata>{{ options }}</metadata>
  </ellipse>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

const interact = require('interactjs')

export default {
  mixins: [stepOptionsMixin],

  data() {
    return {
      options: {
        cx: 10,
        cy: 50,
        rx: 10,
        ry: 20,
        fill: '#bb0000',
        stroke: 'transparent'
      }
    }
  },

  methods: {
    onOptionsSet() {
      const vm = this
      interact(this.$refs.rect)
        .draggable({
          onmove: (event) => {
            vm.options.cx += event.dx / vm.zoom
            vm.options.cy += event.dy / vm.zoom
          }
        })
        .resizable({
          edges: { right: true, bottom: true }
        })
        .on('resizemove', (event) => {
          vm.options.rx = event.rect.width / 2 / vm.zoom
          vm.options.ry = event.rect.height / 2 / vm.zoom
        })
    },
    getOptionsFromSvgGroup() {
      const ellipse = Object.values(this.svgGroup.childNodes).find(
        (node) => node.nodeName === 'ellipse'
      )
      return {
        cx: parseFloat(ellipse.getAttribute('cx')),
        cy: parseFloat(ellipse.getAttribute('cy')),
        rx: parseFloat(ellipse.getAttribute('rx')),
        ry: parseFloat(ellipse.getAttribute('ry')),
        fill: ellipse.getAttribute('fill'),
        stroke: ellipse.getAttribute('stroke')
      }
    },
    async getOptionsFromDb() {
      const filled = this.dbOptions.Rempli === 'Oui'

      return {
        cx: parseFloat(this.dbOptions.Pos_x_centre),
        cy: parseFloat(this.dbOptions.Pos_y_centre),
        rx: parseFloat(this.dbOptions.Largeur) / 2,
        ry: parseFloat(this.dbOptions.Hauteur) / 2,
        fill: filled ? `#${this.dbOptions.Couleur}` : 'transparent',
        stroke: filled ? 'transparent' : `#${this.dbOptions.Couleur}`
      }
    }
  }
}
</script>

<style scoped></style>
