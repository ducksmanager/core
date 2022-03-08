<template>
  <b-card-group deck>
    <b-card
      v-for="({ title }, type) in gameTypes"
      :key="type"
      :title="title"
      img-src="https://picsum.photos/600/300/?image=25"
      :img-alt="title"
      img-top
      align="center"
      @click="iAmReady(type)"
    />
  </b-card-group>
</template>

<script lang="ts">
import { defineComponent, useRouter, reactive, useRoute } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import type Index from '@prisma/client'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Setup',
  setup() {
    const { username, password } = getUser()
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const players = reactive([] as Array<Index.player>)

    const gameTypes = {
      against_bot: { title: t('Play against a bot') },
      against_players: {
        title: t('Play against other humans'),
      },
    }

    const matchmakingSocket = io(`${location.origin}:${process.env.SOCKET_PORT}/matchmaking`)

    const iAmReady = (gameType: string) => {
      matchmakingSocket.emit(
        'iAmReady',
        gameType,
        route.value.params.dataset,
        username,
        password,
        ({ gameId, player }: { gameId: number; player: Index.player }) => {
          setDuckguessrId(player.id)
          matchmakingSocket.close()
          router.replace(`/matchmaking/${gameId}`)
        }
      )

      matchmakingSocket.on('matchStarts', (gameId: number) => {
        setTimeout(() => {
          // Leave time for the iAmReady callback to be called
          console.debug(`Match is starting on game ${gameId}`)
          matchmakingSocket.close()
          router.replace(`/game/${gameId}`)
        }, 200)
      })
    }

    return {
      gameTypes,
      username,
      players,
      iAmReady,
    }
  },
})
</script>

<style scoped lang="scss">
.card {
  cursor: pointer;
  color: black;

  &.player {
    .card {
      max-width: calc(50% - 30px);
    }
  }
}
</style>
