<template>
  <ellipse ref="ellipse" v-bind="options" @click="setStepNumber(stepNumber)">
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
        stroke: 'transparent'
      }
    }
  },

  methods: {
    onOptionsSet() {
      this.enableDragResize(this.$refs.ellipse, 'cx', 'cy', 'rx', 'ry')
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
