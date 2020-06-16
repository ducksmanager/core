<template>
  <g>
    <defs>
      <linearGradient
        id="gradient"
        x1="0%"
        y1="0%"
        :x2="options.direction === 'Vertical' ? '0%' : '100%'"
        :y2="options.direction === 'Vertical' ? '100%' : '0%'"
      >
        <stop
          offset="0%"
          :style="{ 'stop-color': options.colorStart, 'stop-opacity': 1 }"
        />
        <stop
          offset="100%"
          :style="{ 'stop-color': options.colorEnd, 'stop-opacity': 1 }"
        />
      </linearGradient>
    </defs>
    <rect ref="rect" v-bind="options" fill="url(#gradient)">
      <metadata>{{ options }}</metadata>
    </rect>
  </g>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  data() {
    return {
      options: {
        x: 3,
        y: 3,
        width: 10,
        height: 80,
        colorStart: '#D01721',
        colorEnd: '#0000FF',
        direction: 'Vertical'
      }
    }
  },

  methods: {
    onOptionsSet() {
      this.enableDragResize(this.$refs.rect)
    },
    async getOptionsFromDb() {
      return {
        x: parseFloat(this.dbOptions.Pos_x_debut),
        y: parseFloat(this.dbOptions.Pos_y_debut),
        width: parseFloat(
          this.dbOptions.Pos_x_fin - this.dbOptions.Pos_x_debut
        ),
        height: parseFloat(
          this.dbOptions.Pos_y_fin - this.dbOptions.Pos_y_debut
        ),
        fill: `#${this.dbOptions.Couleur}`,
        direction: this.dbOptions.Sens
      }
    }
  }
}
</script>

<style scoped></style>
