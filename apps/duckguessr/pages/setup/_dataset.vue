<template>
  <b-card-group deck>
    <b-card
      v-for="({ title }, type) in gameTypes"
      :key="type"
      :title="title"
      img-src="https://picsum.photos/600/300/?image=25"
      :img-alt="title"
      img-top
      align="center"
      @click="iAmReady(type)"
    />
  </b-card-group>
</template>

<script lang="ts">
import {
  defineComponent,
  useRouter,
  reactive,
  useRoute,
} from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import type Index from '@prisma/client'
import { getUser, setDuckguessrId } from '~/components/user'

const gameTypes = {
  against_bot: { title: 'Play against a bot' },
  against_players: {
    title: 'Play against humans',
  },
}

export default defineComponent({
  name: 'Setup',
  setup() {
    const { username, password } = getUser()
    const router = useRouter()
    const route = useRoute()
    const players = reactive([] as Array<Index.player>)

    const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`)

    const iAmReady = (gameType: string) => {
      matchmakingSocket.emit(
        'iAmReady',
        gameType,
        route.value.params.dataset,
        username,
        password,
        (_: null, { gameId, user }: { gameId: number; user: Index.player }) => {
          setDuckguessrId(user.id)
          matchmakingSocket.close()
          router.replace(`/matchmaking/${gameId}`)
        }
      )
    }

    return {
      gameTypes,
      username,
      players,
      iAmReady,
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
