<template>
  <rect ref="rect" v-bind="options">
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
        x: 5,
        y: 5,
        width: 15,
        height: 15,
        fill: '#ff0000',
        stroke: 'transparent'
      }
    }
  },

  methods: {
    onOptionsSet() {
      this.enableDragResize(this.$refs.rect)
    },
    async getOptionsFromDb() {
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
        fill: filled ? `#${this.dbOptions.Couleur}` : 'transparent',
        stroke: filled ? 'transparent' : `#${this.dbOptions.Couleur}`
      }
    }
  }
}
</script>

<style scoped></style>
