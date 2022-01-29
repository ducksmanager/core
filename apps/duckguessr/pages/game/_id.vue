<template>
  <b-container
    v-if="!game || (!currentRoundNumber && !gameIsFinished)"
    class="text-center"
  >
    Loading...
  </b-container>
  <b-container v-else-if="gameIsFinished" fluid>
    <b-alert show align="center" variant="info">
      This game is finished.
    </b-alert>
    <game-scores
      :scores="game.rounds"
      :players="game.game_players"
      :authors="game.authors"
    />
  </b-container>
  <b-container v-else fluid class="overflow-hidden" style="height: 100vh">
    <round-result-modal
      v-if="(chosenAuthor || remainingTime === 0) && nextRoundStartDate"
      :status="scoreToVariant(currentRoundPlayerScore)"
      :correct-answer="scoreToVariant.answer"
      :round-number="currentRoundNumber"
      :next-round-start-date="nextRoundStartDate"
    />
    <b-row>
      <b-col cols="5" align-self="center">
        <b-img center :src="url" @load="hasUrlLoaded = true" />
      </b-col>
      <b-col cols="5" class="h-100">
        <b-row align-v="center" style="height: 50px">
          <b-col class="text-center">
            <progress-bar
              :available-time="availableTime"
              :remaining-time="remainingTime"
            />
          </b-col>
        </b-row>
        <b-row id="author-list">
          <author-card
            v-for="(author, idx) in game.authors"
            :key="`author-${idx}`"
            :author="author"
            :selectable="
              !game.rounds
                .map(({ personcode }) => personcode)
                .includes(author.personcode)
            "
            @select="
              chosenAuthor = $event
              validateGuess()
            "
          />
        </b-row>
      </b-col>
      <b-col cols="2" class="border vh-100 overflow-auto">
        <h3>Round {{ currentRoundNumber }}</h3>
        <template v-for="score in currentRoundScores">
          <b-alert
            :key="`score-${score.username}`"
            show
            :variant="scoreToVariant(score)"
          >
            {{ score.username }}: {{ score.score_type_name }}
          </b-alert>
        </template>
      </b-col>
    </b-row>
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
  watch,
} from '@nuxtjs/composition-api'

import type Index from '@prisma/client'
import { io, Socket } from 'socket.io-client'
import AuthorCard from '~/components/AuthorCard.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import { getUser } from '@/components/user'
import { roundWithScoresAndPerson } from '~/types/roundWithScoresAndPerson'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '~/types/socketEvents'
import { GuessResponse } from '~/types/guess'

interface gameWithRounds extends Index.games {
  rounds: Array<roundWithScoresAndPerson>
}

export default defineComponent({
  name: 'Game',
  components: { AuthorCard, ProgressBar },
  setup() {
    const { $axios } = useContext()
    const { duckguessrId, username } = getUser()
    const route = useRoute()

    const chosenAuthor = ref(null as string | null)

    const game = ref(null as gameWithRounds | null)
    let gameSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
      null

    const currentRoundScores = ref([] as Array<Index.round_scores>)

    const hasUrlLoaded = ref(false as boolean)

    const now = ref(Date.now() as number)

    const gameIsFinished = computed(() => !nextRoundStartDate.value)

    const currentRoundNumber = computed(
      (): number | null =>
        [...(game.value?.rounds || [])]
          .reverse()
          .find(
            ({ started_at: startedAt }) =>
              startedAt && new Date(startedAt).getTime() < now.value
          )?.round_number || null
    )

    const getRound = (
      searchedRoundNumber: number | null
    ): roundWithScoresAndPerson | null =>
      searchedRoundNumber == null
        ? null
        : (game.value?.rounds || []).find(
            ({ round_number: roundNumber }) =>
              roundNumber === searchedRoundNumber
          ) || null

    const previousRound = computed((): roundWithScoresAndPerson | null =>
      getRound(currentRoundNumber.value!! - 1)
    )

    const currentRound = computed((): roundWithScoresAndPerson | null =>
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
      !currentRound.value ||
      new Date(currentRound.value!.started_at!).getTime() > now.value
        ? Infinity
        : Math.floor(
            Math.max(
              0,
              (new Date(currentRound.value!.finished_at!).getTime() -
                now.value) /
                1000
            )
          )
    )

    const nextRoundStartDate = computed(() => {
      const nextRound =
        currentRoundNumber.value == null
          ? null
          : game.value?.rounds.find(
              ({ round_number: roundNumber }) =>
                roundNumber === currentRoundNumber.value! + 1
            ) || null
      return nextRound?.started_at ? new Date(nextRound?.started_at) : null
    })

    watch(
      () => game.value,
      (game) => {
        if (!game) {
          console.error('No game ID')
        }
      }
    )

    watch(
      () => currentRound.value,
      (currentRound, previousRound) => {
        hasUrlLoaded.value = false
        if (currentRound) {
          if (!gameSocket) {
            gameSocket = io(`${process.env.SOCKET_URL}/game/${game.value!!.id}`)
            gameSocket.on('playerGuessed', (data: GuessResponse) => {
              currentRoundScores.value = [...currentRound.round_scores, data]
            })
          }
          if (currentRound.round_number !== previousRound?.round_number) {
            currentRoundScores.value = []
          }
        }
      }
    )

    watch(
      () => remainingTime.value,
      (remainingTimeValue: number) => {
        if (remainingTimeValue <= 0) {
          if (!chosenAuthor.value) {
            validateGuess()
          }
          chosenAuthor.value = null
          setTimeout(async () => {
            await loadGame()
            currentRoundScores.value = currentRound.value!!.round_scores
          }, 1000)
        }
      }
    )

    const validateGuess = () => {
      gameSocket!.emit(
        'guess',
        username,
        currentRound.value!.id,
        chosenAuthor.value ?? null
      )
    }

    const loadGame = async () => {
      game.value = await $axios.$get(`/api/game/${route.value.params.id}`)
    }

    onMounted(async () => {
      await loadGame()
      if (currentRound.value) {
        setInterval(() => {
          now.value = Date.now()
        }, 1000)
      }
    })

    return {
      game,
      gameIsFinished,
      availableTime,
      remainingTime,
      chosenAuthor,
      hasUrlLoaded,
      previousRound,
      currentRoundNumber,
      currentRound,
      currentRoundScores,
      currentRoundPlayerScore: computed(() =>
        currentRoundScores.value.find(
          ({ player_id: playerId, round_id: roundId }) =>
            duckguessrId === playerId && roundId === currentRound.value!.id
        )
      ),
      nextRoundStartDate,
      validateGuess,
      url: computed(
        () =>
          currentRound.value &&
          `${process.env.CLOUDINARY_URL_ROOT}${currentRound.value.sitecode_url}`
      ),

      scoreToVariant(roundScore: Index.round_scores | null) {
        switch (roundScore?.score_type_name) {
          case null:
            return 'default'
          case 'Correct author':
            return 'success'
          case 'Correct nationality':
            return 'warning'
          default:
            return 'danger'
        }
      },
    }
  },
})
</script>

<style lang="scss">
.container-fluid > .row {
  height: 100vh;
}

#author-list {
  height: calc(100vh - 50px);

  .author-image {
    height: 100%;
  }
}

.progress {
  color: black;
}
</style>
