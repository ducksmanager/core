<template>
  <ellipse ref="ellipse" v-bind="options">
    <metadata>{{ options }}</metadata>
  </ellipse>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

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
        stroke: 'transparent',
      },
    }
  },

  methods: {
    onOptionsSet() {
      const vm = this
      this.enableDragResize(this.$refs.ellipse, {
        onmove: ({ dx, dy }) => {
          vm.options.cx += dx / vm.zoom
          vm.options.cy += dy / vm.zoom
        },
        onresizemove: ({ rect }) => {
          vm.options.rx = rect.width / 2 / vm.zoom
          vm.options.ry = rect.height / 2 / vm.zoom
        },
      })
    },
    async getOptionsFromDb() {
      const filled = this.dbOptions.Rempli === 'Oui'

      return {
        cx: parseFloat(this.dbOptions.Pos_x_centre),
        cy: parseFloat(this.dbOptions.Pos_y_centre),
        rx: parseFloat(this.dbOptions.Largeur) / 2,
        ry: parseFloat(this.dbOptions.Hauteur) / 2,
        fill: filled ? `#${this.dbOptions.Couleur}` : 'transparent',
        stroke: filled ? 'transparent' : `#${this.dbOptions.Couleur}`,
      }
    },
  },
}
</script>

<style scoped></style>
