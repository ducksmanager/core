<template>
  <span>
    <b-icon-square
      stacked
      scale="0.7"
      :style="{ marginTop: '4px' }"
      @click="$emit('click', $event)"
    ></b-icon-square>
    <b-icon-square-fill
      v-b-tooltip.hover
      :title="title"
      stacked
      scale="0.7"
      :style="{ marginLeft: '-16px', marginTop: '-4px' }"
      @click="$emit('click', $event)"
    ></b-icon-square-fill>
  </span>
</template>
<script>
import { BIconSquare, BIconSquareFill } from 'bootstrap-vue'

export default {
  name: 'BIconCustomDuplicate',
  components: {
    BIconSquare,
    BIconSquareFill,
  },
  props: {
    title: {
      type: String,
      default: null,
    },
  },
}
</script>
