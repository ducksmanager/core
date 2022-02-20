<template>
  <div v-if="players">
    <h3 class="text-center mb-5">Podium</h3>
    <div
      v-if="topPlayers.length"
      class="d-flex flex-row justify-content-around"
      style="height: 350px"
    >
      <player-total-score
        v-for="(player, index) in topPlayers"
        :key="player.username"
        :score="player.average_score"
        :username="player.username"
        vertical
        :rank="index === 2 ? 2 : 1 - index"
      />
    </div>
    <div v-else>Il n'y a pas assez de joueurs pour établir un podium.</div>
    <player-total-score
      v-for="{ username, average_score } in otherPlayers"
      :key="username"
      :score="average_score"
      :username="username"
    />
  </div>
</template>
<script lang="ts">
import Index from '@prisma/client'
import { computed, defineComponent, onMounted, ref, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'Podium',

  setup() {
    const { $axios } = useContext()
    const players = ref(null as Index.player[] | null)

    onMounted(async () => {
      players.value = (await $axios.$get(`/api/podium`)).players
    })

    return {
      players,
      topPlayers: computed(() =>
        players.value && players.value.length >= 3
          ? [players.value[1], players.value[0], players.value[2]]
          : []
      ),
      otherPlayers: computed(() => (players.value ? players.value.slice(3) : [])),
    }
  },
})
</script>
