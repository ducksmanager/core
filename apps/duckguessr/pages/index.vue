<template>
  <b-card-group deck>
    <b-card
      v-for="card in cards"
      :key="card"
      :title="card"
      img-src="https://picsum.photos/600/300/?image=25"
      :img-alt="card"
      img-top
      align="center"
      @click="$router.push('/start')"
    >
      {{ card }}
    </b-card>
  </b-card-group>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    return {
      cards: ['All creators', 'US artists'],
    }
  },
})
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
