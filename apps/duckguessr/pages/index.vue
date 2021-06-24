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
            <b-card
              v-for="player in players"
              :key="player.username"
              class="m-3 col-md-1"
              >{{ player.username }}</b-card
            >
          </b-row>
        </template>
        <b-button
          class="m-3"
          variant="info"
          :disabled="players.length < requiredPlayers"
          @click="createGame()"
          >Start game</b-button
        >
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
    const showCurrentGames = ref(false)

    const gameSocket = io(`${process.env.SOCKET_URL}/game`)

    const addPlayer = (player: any) => {
      if (
        player.username &&
        !players.map(({ username }) => username).includes(player.username)
      ) {
        gameId.value = player.gameId
        players.push(player)
      }
    }

    return {
      requiredPlayers: 4,
      username,
      players,
      showCurrentGames,
      gameSocket,
      gameId,
      createGame() {
        router.push({ path: `/game/${gameId.value}` })
      },
      iAmReady() {
        gameSocket.on('iAmReadyWithGameID', (me: any) => {
          console.log('Received iAmReadyWithGameID')
          addPlayer(me)
          gameSocket.emit('whoElseIsReady', me)
        })
        gameSocket.on('whoElseIsReady', (otherPlayer: any) => {
          console.log('Received whoElseIsReady')
          if (otherPlayer.gameId === gameId.value) {
            gameSocket.emit('iAmAlsoReady', players[0])
          }
        })
        gameSocket.on('iAmAlsoReady', (alsoReadyPlayer: any) => {
          console.log(alsoReadyPlayer.username + ' is also ready')
          if (alsoReadyPlayer.gameId === gameId.value) {
            addPlayer(alsoReadyPlayer)
          }
        })
        gameSocket.emit('iAmReady', { id: 1, username: username.value })
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
