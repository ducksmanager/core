<template>
  <b-container align="center">
    <b-row align-v="center" style="height: 100vh">
      <b-col align>
        Welcome to Duckguessr! Please enter your username.
        <template v-if="!gameId">
          <b-form @submit.prevent="iAmReady()">
            <b-input
              v-model="username"
              class="my-2"
              placeholder="Username"
              autofocus
              required
            />
            <b-button type="submit" variant="success">OK</b-button>
          </b-form>
        </template>
        <template v-else>
          <b-row align-h="center">
            <b-col>Waiting for other players...</b-col>
          </b-row>
          <b-row align-h="center">
            <b-card
              v-for="player in players"
              :key="player.username"
              class="m-3 col-lg-3"
              >{{ player.username }}</b-card
            >
          </b-row>
        </template>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import {
  defineComponent,
  useRouter,
  ref,
  reactive,
  onMounted,
} from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'

interface Player {
  gameId: number
  userId: number
  username: string
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const username = ref('')
    const gameId = ref(null as number | null)
    const players = reactive([] as Array<Player>)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`)

    const addPlayer = (player: any) => {
      if (
        player.username &&
        !players.map(({ username }) => username).includes(player.username)
      ) {
        gameId.value = player.gameId
        players.push(player)
        if (players.length === requiredPlayers) {
          matchmakingSocket.emit('matchStarts', { gameId: gameId.value })
          matchmakingSocket.close()
          router.replace(`/game/${gameId.value}`)
        }
      }
    }

    const iAmReady = () => {
      sessionStorage.setItem('username', username.value)
      matchmakingSocket.on('iAmReadyWithGameID', (me: any) => {
        console.debug(
          `${username.value}-Received iAmReadyWithGameID from ${me.username}`
        )
        addPlayer(me)
        matchmakingSocket.emit('whoElseIsReady', me)
      })
      matchmakingSocket.on('whoElseIsReady', (otherPlayer: any) => {
        console.debug(
          `${username.value}-Received whoElseIsReady from ${otherPlayer.username}`
        )
        if (otherPlayer.gameId === gameId.value) {
          matchmakingSocket.emit('iAmAlsoReady', players[0])
          addPlayer(otherPlayer)
        }
      })
      matchmakingSocket.on('iAmAlsoReady', (alsoReadyPlayer: any) => {
        console.debug(
          `${username.value}-${alsoReadyPlayer.username} is also ready`
        )
        if (alsoReadyPlayer.gameId === gameId.value) {
          addPlayer(alsoReadyPlayer)
        }
      })
      matchmakingSocket.emit('iAmReady', { username: username.value })
    }

    const requiredPlayers = 2

    onMounted(() => {
      username.value = sessionStorage.getItem('username') || ''
      if (username.value) {
        iAmReady()
      }
    })

    return {
      username,
      players,
      gameId,
      iAmReady,
    }
  },
})
</script>

<style lang="scss">
.card-deck .card {
  max-width: calc(50% - 30px);
}
</style>
