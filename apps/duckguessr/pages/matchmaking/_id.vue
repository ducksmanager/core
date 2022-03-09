<template>
  <div v-if="!isReady">{{ t('Loading...') }}</div>
  <waiting-for-players v-else :usernames="playersUsernames" :game-id="gameId" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  useRoute,
  useRouter,
} from '@nuxtjs/composition-api'
import Index from '@prisma/client'
import { io } from 'socket.io-client'
import { useI18n } from 'nuxt-i18n-composable'
import { setDuckguessrId } from '@/components/user'

export default defineComponent({
  name: 'Matchmaking',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const playersUsernames = reactive([] as Array<string>)
    const isReady = ref(false as Boolean)

    const gameId = parseInt(route.value.params.id)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking/${gameId}`, {
      auth: {
        cookie: document.cookie,
      },
    })

    const addPlayer = (username: string) => {
      if (username && !playersUsernames.includes(username)) {
        playersUsernames.push(username)
      }
    }

    onMounted(() => {
      matchmakingSocket.on('playerJoined', (username: string) => {
        isReady.value = true
        console.debug(`${username} is also ready`)
        addPlayer(username)
      })
      matchmakingSocket.on('matchStarts', (gameId: number) => {
        setTimeout(() => {
          // Leave time for the iAmAlsoReady callback to be called
          console.debug(`Match starts on game ${gameId}`)
          matchmakingSocket.close()
          router.replace(`/game/${gameId}`)
        }, 200)
      })

      matchmakingSocket.emit('iAmAlsoReady', gameId, ({ player }: { player: Index.player }) => {
        setDuckguessrId(player.id)
        addPlayer(player.username)
      })
    })

    return {
      t,
      isReady,
      gameId,
      playersUsernames,
    }
  },
})
</script>
