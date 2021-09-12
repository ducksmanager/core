<template>
  <rect
    ref="rect"
    v-bind="attributes"
    x="0"
    y="0"
    :width="width"
    :height="height"
  >
    <metadata>{{ options }}</metadata>
  </rect>
</template>

<script>
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  props: {
    options: {
      type: Object,
      default: () => ({
        fill: '#ff0000',
      }),
    },
  },

  data: () => ({
    attributeKeys: ['fill'],
  }),
}
</script>

<style scoped></style>
