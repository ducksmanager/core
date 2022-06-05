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
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, useRoute, useRouter } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { MatchDetails } from '~/types/matchDetails'
import { userStore } from '~/store/user'

const router = useRouter()
const route = useRoute()
const playersUsernames = reactive([] as Array<string>)
const isBotAvailableForGame = ref(null as Boolean | null)

const gameId = parseInt(route.value.params.id)

const isAnonymous = computed(() => userStore().isAnonymous)

const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking/${gameId}`, {
  auth: {
    cookie: useCookies().getAll(),
  },
})

const addPlayer = (username: string) => {
  if (!playersUsernames.includes(username)) {
    playersUsernames.push(username)
  }
}

const startMatch = () => {
  matchmakingSocket.emit('startMatch', gameId)
}

const addBot = () => {
  matchmakingSocket.emit('addBot', gameId)
}

onMounted(() => {
  matchmakingSocket.on('playerJoined', (username: string) => {
    console.debug(`${username} is also ready`)
    addPlayer(username)
  })
  matchmakingSocket.on('matchStarts', (gameId: number) => {
    setTimeout(() => {
      // Leave time for the joinMatch callback to be called
      console.debug(`Match starts on game ${gameId}`)
      matchmakingSocket.close()
      router.replace(`/game/${gameId}`)
    }, 200)
  })

  setTimeout(() => {
    matchmakingSocket.emit('joinMatch', gameId, ({ players, isBotAvailable }: MatchDetails) => {
      isBotAvailableForGame.value = isBotAvailable
      for (const player of players) {
        addPlayer(player.username)
      }
    })
  }, 200)
})
</script>
