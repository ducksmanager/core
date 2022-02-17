<template>
  <b-container align="center">
    <b-row align-h="center">
      <b-card v-for="username in playersUsernames" :key="username" class="player m-3 col-lg-3">
        <user-info :username="username" />
      </b-card>
    </b-row>
    <b-row align-h="center">
      <b-col>Waiting for other players...</b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, useRoute, useRouter } from '@nuxtjs/composition-api'
import Index from '@prisma/client'
import { io } from 'socket.io-client'
import { getUser, setDuckguessrId } from '@/components/user'

export default defineComponent({
  name: 'Matchmaking',
  setup() {
    const { username, password } = getUser()
    const router = useRouter()
    const route = useRoute()
    const playersUsernames = reactive([] as Array<string>)

    const gameId = parseInt(route.value.params.id)
    let requiredPlayers: number

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking/${gameId}`)

    const addPlayer = (username: string) => {
      if (username && !playersUsernames.includes(username)) {
        playersUsernames.push(username)
        if (playersUsernames.length === requiredPlayers) {
          matchmakingSocket.emit('matchStarts', gameId)
          matchmakingSocket.close()
          router.replace(`/game/${gameId}`)
        }
      }
    }

    onMounted(() => {
      matchmakingSocket.on('playerJoined', (username: string) => {
        console.debug(`${username} is also ready`)
        addPlayer(username)
      })

      matchmakingSocket.emit(
        'iAmAlsoReady',
        gameId,
        username,
        password,
        ({ player, gameType }: { player: Index.player; gameType: string }) => {
          requiredPlayers = gameType === 'against_bot' ? 1 : 2
          setDuckguessrId(player.id)
          addPlayer(player.username)
        }
      )
    })

    return {
      playersUsernames,
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
