<template>
  <b-container align="center">
    <b-row align-v="center">
      <b-col align>
        <template v-if="!gameId">
          <b-form @submit.prevent="iAmReady()">
            <b-input
              v-model="username"
              class="my-2"
              placeholder="Username"
              autofocus
              required
            />
            <b-button
              type="submit"
              variant="success"
              :disabled="isButtonDisabled"
            >
              OK
            </b-button>
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
            >
              {{ player.username }}
            </b-card>
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
import type Index from '@prisma/client'
import useUser from '@/components/user'

export default defineComponent({
  setup() {
    const { username, password } = useUser()
    const router = useRouter()
    const gameId = ref(null as number | null)
    const players = reactive([] as Array<Index.players>)
    const isButtonDisabled = ref(false as boolean)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`)

    const addPlayer = (player: Index.players, existingGameId: number) => {
      if (
        player.username &&
        !players.map(({ username }) => username).includes(player.username)
      ) {
        gameId.value = existingGameId
        players.push(player)
        if (players.length === requiredPlayers) {
          matchmakingSocket.emit('matchStarts', { gameId: gameId.value })
          matchmakingSocket.close()
          router.replace(`/game/${gameId.value}`)
        }
      }
    }

    const iAmReady = () => {
      isButtonDisabled.value = true
      matchmakingSocket.on(
        'iAmReadyWithGameID',
        (user: Index.players, gameId: number) => {
          sessionStorage.setItem('user', JSON.stringify(user))
          console.debug(
            `${username}-Received iAmReadyWithGameID from ${user.username}`
          )
          addPlayer(user, gameId)
          matchmakingSocket.emit('whoElseIsReady', user, gameId)
        }
      )
      matchmakingSocket.on(
        'whoElseIsReady',
        (otherPlayer: Index.players, otherPlayerGameId: number) => {
          console.debug(
            `${username}-Received whoElseIsReady from ${otherPlayer.username}`
          )
          if (otherPlayerGameId === gameId.value) {
            matchmakingSocket.emit(
              'iAmAlsoReady',
              players[0],
              otherPlayerGameId
            )
            addPlayer(otherPlayer, otherPlayerGameId)
          }
        }
      )
      matchmakingSocket.on(
        'iAmAlsoReady',
        (user: Index.players, existingGameId: number) => {
          console.debug(`${username}-${user.username} is also ready`)
          if (existingGameId === gameId.value) {
            addPlayer(user, existingGameId)
          }
        }
      )
      matchmakingSocket.emit('iAmReady', { username, password })
    }

    const requiredPlayers = 2

    onMounted(() => {
      if (username) {
        iAmReady()
      }
    })

    return {
      isButtonDisabled: false,
      username: useUser().username,
      players,
      gameId,
      iAmReady,
    }
  },
})
</script>

<style lang="scss">
.card {
  color: black;

  .card {
    max-width: calc(50% - 30px);
  }
}
</style>
