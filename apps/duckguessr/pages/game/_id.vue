<template>
  <b-container v-if="gameIsFinished" fluid>
    <b-alert show align="center" variant="info"> {{ t('This game is finished.') }} </b-alert>
    <game-scores
      :rounds="game.rounds"
      :players="game.game_players"
      :authors="game.authors"
      :game-id="game.id"
    />
  </b-container>
  <b-container v-else-if="!game || !currentRoundNumber" class="text-center">
    {{ t('Loading...') }}
  </b-container>
  <b-container v-else fluid class="d-flex flex-grow-1 p-0">
    <game
      :available-time="availableTime"
      :chosen-author="chosenAuthor"
      :current-round="currentRound"
      :authors="game.authors"
      :players="players"
      :previous-personcodes="game.rounds.map(({ personcode }) => personcode)"
      :remaining-time="remainingTime"
      @select-author="
        chosenAuthor = $event
        validateGuess()
      "
    />
    <round-result-modal
      v-if="currentRoundPlayerScore !== undefined"
      :status="scoreToVariant(currentRoundPlayerScore)"
      :speed-bonus="currentRoundPlayerScore.speed_bonus"
      :correct-author="getAuthor(currentRound.personcode)"
      :round-number="currentRoundNumber"
      :next-round-start-date="nextRoundStartDate"
    />
  </b-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  useContext,
  useRoute,
} from '@nuxtjs/composition-api'

import type Index from '@prisma/client'
import { io, Socket } from 'socket.io-client'
import Vue from 'vue'
import { useI18n } from 'nuxt-i18n-composable'
import { useCookies } from '@vueuse/integrations/useCookies'
import { getDuckguessrId } from '@/composables/user'
import { Author, RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'
import { ClientToServerEvents, ServerToClientEvents } from '~/types/socketEvents'
import { useScoreToVariant } from '~/composables/use-score-to-variant'

interface GamePlayerWithFullPlayer extends Index.game_player {
  player: Index.player
}

interface GameFull extends Index.game {
  authors: Author[]
  rounds: RoundWithScoresAndAuthor[]
  game_players: GamePlayerWithFullPlayer[]
}

export default defineComponent({
  name: 'GamePage',
  setup() {
    const { $axios } = useContext()
    const duckguessrId = getDuckguessrId()
    const { t } = useI18n()
    const route = useRoute()

    const chosenAuthor = ref(null as string | null)
    const gameIsFinished = ref(false as boolean)

    const game = ref(null as GameFull | null)
    let gameSocket: Socket<ServerToClientEvents, ClientToServerEvents>

    const currentRoundNumber = ref(null as number | null)

    const players = computed(
      (): Array<Index.player> =>
        game.value ? game.value.game_players.map(({ player }) => player) : []
    )

    const hasUrlLoaded = ref(false as boolean)

    const now = ref(Date.now() as number)

    const getRound = (searchedRoundNumber: number | null): RoundWithScoresAndAuthor | null =>
      searchedRoundNumber == null
        ? null
        : (game.value?.rounds || []).find(
            ({ round_number: roundNumber }) => roundNumber === searchedRoundNumber
          ) || null

    const currentRound = computed((): RoundWithScoresAndAuthor | null =>
      getRound(currentRoundNumber.value)
    )

    const availableTime = computed(() =>
      !currentRound.value || !currentRound.value.finished_at
        ? Infinity
        : (new Date(currentRound.value!.finished_at).getTime() -
            new Date(currentRound.value!.started_at!).getTime()) /
          1000
    )

    const remainingTime = computed(() =>
      !currentRound.value || new Date(currentRound.value!.started_at!).getTime() > now.value
        ? Infinity
        : Math.floor(
            Math.max(0, (new Date(currentRound.value!.finished_at!).getTime() - now.value) / 1000)
          )
    )

    const nextRoundStartDate = computed(() => {
      const nextRound =
        currentRoundNumber.value == null
          ? null
          : game.value?.rounds.find(
              ({ round_number: roundNumber }) => roundNumber === currentRoundNumber.value! + 1
            ) || null
      return nextRound?.started_at ? new Date(nextRound?.started_at) : null
    })

    const validateGuess = () => {
      gameSocket!.emit('guess', currentRound.value!.id, chosenAuthor.value)
    }

    const loadGame = async () => {
      game.value = await $axios.$get(`/api/game/${route.value.params.id}`)
      if (game.value) {
        const now = new Date().toISOString()
        gameIsFinished.value = game.value.rounds.every(
          ({ finished_at }) => finished_at && finished_at.toString() < now
        )
      } else {
        console.error('No game for this ID')
      }
    }

    onMounted(async () => {
      await loadGame()

      gameSocket = io(`${process.env.SOCKET_URL}/game/${route.value.params.id}`, {
        auth: {
          cookie: useCookies().getAll(),
        },
      })
      gameSocket
        .on('roundStarts', (round) => {
          currentRoundNumber.value = round!.round_number
          Vue.set(game.value!.rounds, currentRoundNumber.value! - 1, round)
          hasUrlLoaded.value = false
        })
        .on('roundEnds', (round) => {
          chosenAuthor.value = null
          Vue.set(game.value!.rounds, currentRoundNumber.value! - 1, round)
        })
        .on('gameEnds', () => {
          gameIsFinished.value = true
        })
        .on('playerGuessed', ({ roundScore, answer }) => {
          if (roundScore.player_id === duckguessrId) {
            Vue.set(game.value!.rounds[currentRoundNumber.value! - 1], 'personcode', answer)
          }
          game.value!.rounds[currentRoundNumber.value! - 1].round_scores.push(roundScore)
        })
      setInterval(() => {
        now.value = Date.now()
      }, 1000)
    })

    const currentRoundScores = computed(() =>
      !currentRound.value ? null : currentRound.value.round_scores
    )

    const currentRoundPlayerScore = computed(() =>
      (currentRoundScores.value || []).find(({ player_id: playerId }) => duckguessrId === playerId)
    )

    return {
      t,
      game,
      gameIsFinished,
      players,
      availableTime,
      remainingTime,
      chosenAuthor,
      hasUrlLoaded,
      currentRoundNumber,
      currentRound,
      nextRoundStartDate,
      currentRoundPlayerScore,

      validateGuess,

      getAuthor: (personcode2: string): Author =>
        game.value!.authors.find(({ personcode }) => personcode2 === personcode)!,

      scoreToVariant: useScoreToVariant,
    }
  },
})
</script>

<style lang="scss">
.alert {
  > *:nth-child(1) {
    width: 33%;
  }
  > *:nth-child(2) {
    width: 67%;
  }
}
</style>
