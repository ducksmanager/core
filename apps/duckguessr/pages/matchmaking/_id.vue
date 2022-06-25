<template>
  <div>
    <alert-not-connected v-if="isAnonymous === true" />
    <waiting-for-players
      v-if="players.length"
      :players="players"
      :game-id="gameId"
      :is-bot-available="isBotAvailableForGame"
      @start-match="startMatch"
      @add-bot="addBot"
      @remove-bot="removeBot"
    />
  </div>
</template>

<script lang="ts" setup>
import Index from '@prisma/client'
import { computed, ref, useRoute, useRouter, watch } from '@nuxtjs/composition-api'
import { io, Socket } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { MatchDetails } from '~/types/matchDetails'
import { userStore } from '~/store/user'

const router = useRouter()
const route = useRoute()
const players = ref([] as Array<Index.player>)
const isBotAvailableForGame = ref(null as Boolean | null)

const gameId = parseInt(route.value.params.id)

const isAnonymous = computed(() => userStore().isAnonymous)

const matchmakingSocket = ref(null as Socket | null)

const addPlayer = (player: Index.player) => {
  if (!players.value.find(({ username }) => username === player.username)) {
    players.value.push(player)
  }
}

const removePlayer = (player: Index.player) => {
  players.value = players.value.filter(({ username }) => username !== player.username)
}

const startMatch = () => {
  matchmakingSocket.value!.emit('startMatch')
}

const addBot = () => {
  matchmakingSocket.value!.emit('addBot')
}

const removeBot = () => {
  matchmakingSocket.value!.emit('removeBot')
}

watch(
  () => userStore().user,
  (value) => {
    if (value) {
      matchmakingSocket.value = io(`${process.env.SOCKET_URL}/matchmaking/${gameId}`, {
        auth: {
          cookie: useCookies().getAll(),
        },
      })
        .on('playerConnectedToMatch', () => {
          matchmakingSocket.value!.emit(
            'joinMatch',
            ({ players, isBotAvailable }: MatchDetails) => {
              isBotAvailableForGame.value = isBotAvailable
              for (const player of players) {
                addPlayer(player)
              }
            }
          )
        })
        .on('connect', () => {
          matchmakingSocket
            .value!.on('playerJoined', (player: Index.player) => {
              console.debug(`${player.username} is also ready`)
              addPlayer(player)
            })
            .on('playerLeft', (player: Index.player) => {
              console.debug(`${player.username} has left`)
              removePlayer(player)
            })
            .on('matchStarts', () => {
              setTimeout(() => {
                // Leave time for the joinMatch callback to be called
                console.debug(`Match starts on game ${gameId}`)
                matchmakingSocket.value!.close()
                router.replace(`/game/${gameId}`)
              }, 200)
            })
        })
    }
  },
  { immediate: true }
)
</script>
