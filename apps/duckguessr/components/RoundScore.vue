<template>
  <div>
    <h6>{{ scoreTypeName }}</h6>
    <div>{{ score }} points</div>
    <small v-if="speedBonus">+ <b-icon-stopwatch-fill /> Speed bonus: {{ speedBonus }}</small>
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { BIconStopwatchFill } from 'bootstrap-vue'

export default defineComponent({
  components: {
    BIconStopwatchFill,
  },
  props: {
    scoreTypeName: { type: String, required: true },
    score: { type: Number, required: true },
    speedBonus: { type: Number, default: null },
  },
})
</script>

<style scoped></style>
