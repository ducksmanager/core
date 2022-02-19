<template>
  <b-container align="center">
    <b-row align-h="center">
      <b-card v-for="username in playersUsernames" :key="username" class="player m-3 col-lg-3">
        <user-info :username="username" />
      </b-card>
    </b-row>
    <b-row align-h="center">
      <b-col>Waiting for other players...</b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, useRoute, useRouter } from '@nuxtjs/composition-api'
import Index from '@prisma/client'
import { io } from 'socket.io-client'
import { getUser, setDuckguessrId } from '@/components/user'

export default defineComponent({
  name: 'Matchmaking',
  setup() {
    const { username, password } = getUser()
    const router = useRouter()
    const route = useRoute()
    const playersUsernames = reactive([] as Array<string>)

    const gameId = parseInt(route.value.params.id)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking/${gameId}`)

    const addPlayer = (username: string) => {
      if (username && !playersUsernames.includes(username)) {
        playersUsernames.push(username)
      }
    }

    onMounted(() => {
      matchmakingSocket.on('playerJoined', (username: string) => {
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
      playersUsernames,
    }
  },
})
</script>

<style scoped lang="scss">
.card {
  cursor: pointer;
  color: black;

  &.player {
    .card {
      max-width: calc(50% - 30px);
    }
  }
}
</style>
