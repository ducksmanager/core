<template>
  <g>
    <metadata>{{ options }}</metadata>
    <rect
      ref="rect1"
      v-bind="{
        ...attributes,
        width: 0.5,
        stroke: 'black',
        x: dimensions.width / 2 - 0.25,
        y: dimensions.height / 2 - options.yDistanceFromCenter - options.height,
      }"
    >
    </rect>
    <rect
      ref="rect2"
      v-bind="{
        ...attributes,
        width: 0.5,
        stroke: 'black',
        x: dimensions.width / 2 - 0.25,
        y: dimensions.height / 2 + options.yDistanceFromCenter,
      }"
    >
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
        yDistanceFromCenter: 5,
        height: 15,
      }),
    },
  },
  data: () => ({
    attributeKeys: ['height'],
  }),

  mounted() {
    const vm = this
    const onmove = ({ dy, currentTarget }) => {
      const isStaple2 = vm.$refs.rect2 === currentTarget
      const yDistanceFromCenter = Math.min(
        Math.max(
          vm.options.height,
          parseInt(
            vm.options.yDistanceFromCenter +
              ((isStaple2 ? 1 : -1) * dy) / vm.zoom
          )
        ),
        vm.dimensions.height / 2 - vm.options.height * 2
      )
      vm.$root.$emit('set-options', {
        yDistanceFromCenter,
      })
    }
    if (this.options.yDistanceFromCenter === undefined) {
      this.$root.$emit('set-options', {
        yDistanceFromCenter:
          parseInt(this.resolveStringTemplates(this.options.y2)) -
          this.dimensions.height / 2,
      })
    }
    if (typeof this.options.height === 'string') {
      this.$root.$emit('set-options', {
        height: parseInt(this.resolveStringTemplates(this.options.height)),
      })
    }
    this.enableDragResize(this.$refs.rect1, { onmove })
    this.enableDragResize(this.$refs.rect2, { onmove })
  },
}
</script>

<style scoped></style>
