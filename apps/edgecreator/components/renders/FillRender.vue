<template>
  <rect ref="rect" v-bind="options" x="0" y="0" :width="width" :height="height">
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
        fill: '#ff0000',
      },
    }
  },
}
</script>

<style scoped></style>
