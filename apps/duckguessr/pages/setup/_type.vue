<template>
  <b-card-group v-if="!players.length" deck>
    <b-card
      v-for="({ title, disabled }, type) in cards"
      :key="type"
      :title="title"
      :class="{ disabled }"
      img-src="https://picsum.photos/600/300/?image=25"
      :img-alt="title"
      img-top
      align="center"
      @click="iAmReady(type)"
    />
  </b-card-group>
  <b-container v-else align="center">
    <b-row align-h="center">
      <b-card
        v-for="player in players"
        :key="player.username"
        class="player m-3 col-lg-3"
      >
        <user :username="player.username" />
      </b-card>
    </b-row>
    <b-row align-h="center">
      <b-col>Waiting for other players...</b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, useRouter, reactive } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import type Index from '@prisma/client'
import useUser from '~/components/user'

const cards = {
  againstBot: { title: 'Play against a bot (coming soon)', disabled: true },
  againstHumans: {
    title: 'Play against humans',
  },
}

const requiredPlayers = 2

let gameId: number | null = null

export default defineComponent({
  name: 'Setup',
  setup() {
    const { username, password } = useUser()
    const router = useRouter()
    const players = reactive([] as Array<Index.players>)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`)

    const addPlayer = (player: Index.players, existingGameId: number) => {
      if (
        player.username &&
        !players.map(({ username }) => username).includes(player.username)
      ) {
        gameId = existingGameId
        players.push(player)
        if (players.length === requiredPlayers) {
          matchmakingSocket.emit('matchStarts', { gameId })
          matchmakingSocket.close()
          router.replace(`/game/${gameId}`)
        }
      }
    }

    const iAmReady = (type: string) => {
      matchmakingSocket.on(
        'iAmReadyWithGameID',
        (user: Index.players, gameId: number) => {
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
          if (otherPlayerGameId === gameId) {
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
          if (existingGameId === gameId) {
            addPlayer(user, existingGameId)
          }
        }
      )
      matchmakingSocket.emit('iAmReady', { type, username, password })
    }

    return {
      cards,
      username: useUser().username,
      players,
      iAmReady,
    }
  },
})
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;

  &.disabled {
    cursor: not-allowed;
    background-image: linear-gradient(
      120deg,
      #e0e0e0 25%,
      #ffffff 25%,
      #ffffff 50%,
      #e0e0e0 50%,
      #e0e0e0 75%,
      #ffffff 75%,
      #ffffff 100%
    );
    background-size: 40% 100%;
  }

  &.player {
    .card {
      max-width: calc(50% - 30px);
    }
  }
}
</style>
