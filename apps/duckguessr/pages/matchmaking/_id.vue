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
import { getUser, setDuckguessrId } from '@/components/user'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Matchmaking',
  setup() {
    const { username, password } = getUser()
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const playersUsernames = reactive([] as Array<string>)
    const isReady = ref(false as Boolean)

    const gameId = parseInt(route.value.params.id)

    const matchmakingSocket = io(
      `${location.origin}:${process.env.SOCKET_PORT}/matchmaking/${gameId}`
    )

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

      matchmakingSocket.emit(
        'iAmAlsoReady',
        gameId,
        username,
        password,
        ({ player }: { player: Index.player }) => {
          setDuckguessrId(player.id)
          addPlayer(player.username)
        }
      )
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
