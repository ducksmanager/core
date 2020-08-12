<template>
  <ellipse ref="ellipse" v-bind="options">
    <metadata>{{ options }}</metadata>
  </ellipse>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  props: {
    options: {
      type: Object,
      default: () => ({
        cx: 10,
        cy: 50,
        rx: 10,
        ry: 20,
        fill: '#bb0000',
        stroke: 'transparent',
      }),
    },
  },

  mounted() {
    const vm = this
    this.enableDragResize(this.$refs.ellipse, {
      onmove: ({ dx, dy }) => {
        vm.$root.$emit('set-option', 'cx', vm.options.cx + dx / vm.zoom)
        vm.$root.$emit('set-option', 'cy', vm.options.cy + dy / vm.zoom)
      },
      onresizemove: ({ rect }) => {
        vm.$root.$emit('set-option', 'rx', rect.width / 2 / vm.zoom)
        vm.$root.$emit('set-option', 'ry', rect.height / 2 / vm.zoom)
      },
    })
  },
}
</script>

<style scoped></style>
