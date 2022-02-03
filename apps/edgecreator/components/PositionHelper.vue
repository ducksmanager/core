<template>
  <div v-if="positionInCanvas" class="cursor-position position-fixed p-2">
    <div>{{ `X = ${positionInCanvas[0]} mm` }}</div>
    <div>{{ `Y = ${positionInCanvas[1]} mm` }}</div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { ui } from '~/stores/ui'

export default {
  name: 'PositionHelper',

  computed: {
    ...mapState(ui, ['positionInCanvas']),
  },
}
</script>

<style scoped></style>
