<template>
  <b-container align="center" fluid>
    <b-row align-v="center" style="height: 100vh">
      <b-col>
        <b-button variant="info" @click="createGame()">Start game</b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, useContext, useRouter } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { $axios } = useContext()
    const router = useRouter()

    return {
      createGame: async () => {
        const { gameId } = await $axios.$put(`/api/game`)
        router.push({ path: `/game/${gameId}` })
      },
    }
  },
})
</script>

<style lang="scss"></style>
