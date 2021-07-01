<template>
  <b-container align="center" fluid>
    <b-row align-v="center" style="height: 100vh">
      <b-col align>
        <template v-if="!gameId">
          <b-form @submit.prevent="iAmReady()">
            <b-input v-model="username" placeholder="Username" required />
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
              class="m-3 col-md-1"
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
          router.replace(`/game/${gameId.value}`)
        }
      }
    }

    const requiredPlayers = 4
    return {
      username,
      players,
      gameId,
      iAmReady() {
        matchmakingSocket.on('iAmReadyWithGameID', (me: any) => {
          console.debug(
            username.value +
              '-' +
              'Received iAmReadyWithGameID from ' +
              me.username
          )
          addPlayer(me)
          matchmakingSocket.emit('whoElseIsReady', me)
        })
        matchmakingSocket.on('whoElseIsReady', (otherPlayer: any) => {
          console.debug(
            username.value +
              '-' +
              'Received whoElseIsReady from ' +
              otherPlayer.username
          )
          if (otherPlayer.gameId === gameId.value) {
            addPlayer(otherPlayer)
            matchmakingSocket.emit('iAmAlsoReady', players[0])
          }
        })
        matchmakingSocket.on('iAmAlsoReady', (alsoReadyPlayer: any) => {
          console.debug(
            username.value + '-' + alsoReadyPlayer.username + ' is also ready'
          )
          if (alsoReadyPlayer.gameId === gameId.value) {
            addPlayer(alsoReadyPlayer)
          }
        })
        matchmakingSocket.emit('iAmReady', { id: 1, username: username.value })
      },
    }
  },
})
</script>

<style lang="scss">
.card-deck .card {
  max-width: calc(50% - 30px);
}
</style>
