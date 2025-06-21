<template>
  <waiting-for-players
    v-if="players.length"
    :players="players"
    :game-players-stats="gamePlayersStats"
    :game-id="gameId"
    :is-bot-available="isBotAvailableForGame"
    @start-match="startMatch"
    @add-bot="addBot"
    @remove-bot="removeBot"
  />
</template>

<script lang="ts" setup>
import Index from '@prisma/client'
import { ref, watch } from '@nuxtjs/composition-api'
import { Socket } from 'socket.io-client'
import { MatchDetails } from '~/types/matchDetails'
import { userStore } from '~/store/user'
import { ClientToServerEvents, ServerToClientEvents } from '~/types/socketEvents'
import { UserMedalPoints } from '~/types/playerStats'

const players = ref([] as Index.player[])
const gamePlayersStats = ref(null as UserMedalPoints[] | null)
const isBotAvailableForGame = ref(null as Boolean | null)

const matchmakingProps = defineProps<{
  gameId: number
  gameSocket: Socket<ServerToClientEvents, ClientToServerEvents>
}>()

const emit = defineEmits(['start-match'])

const addPlayer = (player: Index.player) => {
  if (!players.value.find(({ username }) => username === player.username)) {
    players.value.push(player)
  }
}

const removePlayer = (player: Index.player) => {
  players.value = players.value.filter(({ username }) => username !== player.username)
}

const startMatch = () => {
  matchmakingProps.gameSocket.emit('startMatch')
}

const addBot = () => {
  matchmakingProps.gameSocket.emit('addBot')
}

const removeBot = () => {
  matchmakingProps.gameSocket.emit('removeBot')
}

watch(
  () => userStore().user,
  (value) => {
    if (value) {
      matchmakingProps.gameSocket
        .on('playerConnectedToMatch', () => {
          matchmakingProps.gameSocket.emit(
            'joinMatch',
            ({ players, isBotAvailable, playerStats }: MatchDetails) => {
              isBotAvailableForGame.value = isBotAvailable
              gamePlayersStats.value = playerStats
              for (const player of players) {
                addPlayer(player)
              }
            }
          )
        })
        .on('playerJoined', (player: Index.player) => {
          console.debug(`${player.username} is also ready`)
          addPlayer(player)
        })
        .on('playerLeft', (player: Index.player) => {
          console.debug(`${player.username} has left`)
          removePlayer(player)
        })
        .on('matchStarts', () => {
          console.debug(`Match starts on game ${matchmakingProps.gameId}`)
          emit('start-match')
        })
    }
  },
  { immediate: true }
)
</script>
