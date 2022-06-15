<template>
  <div>
    <alert-not-connected v-if="isAnonymous === true" />
    <waiting-for-players
      v-if="playersUsernames.length"
      :usernames="playersUsernames"
      :game-id="gameId"
      :is-bot-available="isBotAvailableForGame"
      @start-match="startMatch"
      @add-bot="addBot"
      @remove-bot="removeBot"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, useRoute, useRouter, watch } from '@nuxtjs/composition-api'
import { io, Socket } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { MatchDetails } from '~/types/matchDetails'
import { userStore } from '~/store/user'

const router = useRouter()
const route = useRoute()
const playersUsernames = ref([] as Array<string>)
const isBotAvailableForGame = ref(null as Boolean | null)

const gameId = parseInt(route.value.params.id)

const isAnonymous = computed(() => userStore().isAnonymous)

const matchmakingSocket = ref(null as Socket | null)

const addPlayer = (username: string) => {
  if (!playersUsernames.value.includes(username)) {
    playersUsernames.value.push(username)
  }
}

const removePlayer = (username: string) => {
  playersUsernames.value = playersUsernames.value.filter((item) => item !== username)
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
        .on('playerJoined', (username: string) => {
          console.debug(`${username} is also ready`)
          addPlayer(username)
        })
        .on('playerLeft', (username: string) => {
          console.debug(`${username} has left`)
          removePlayer(username)
        })
        .on('matchStarts', () => {
          setTimeout(() => {
            // Leave time for the joinMatch callback to be called
            console.debug(`Match starts on game ${gameId}`)
            matchmakingSocket.value!.close()
            router.replace(`/game/${gameId}`)
          }, 200)
        })
        .emit('joinMatch', ({ players, isBotAvailable }: MatchDetails) => {
          isBotAvailableForGame.value = isBotAvailable
          for (const player of players) {
            addPlayer(player.username)
          }
        })
    }
  },
  { immediate: true }
)
</script>
