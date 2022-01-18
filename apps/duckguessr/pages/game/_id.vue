<template>
  <b-container
    v-if="!game || (!currentRound && !gameIsFinished)"
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
      :status="scoreTypeNameToVariant(currentRoundPlayerScoreTypeName)"
      :round-number="currentRound.round_number"
      :next-round-start-date="nextRoundStartDate"
    />
    <b-row>
      <b-col cols="5" align-self="center">
        <b-img center :src="url" @load="hasUrlLoaded = true" />
      </b-col>
      <b-col cols="5" class="h-100">
        <b-row align-v="center" style="height: 50px">
          <b-col class="text-center">
            <b-progress :variant="progressbarVariant">
              <div class="position-absolute pt-2 w-100">
                Guess the author! ({{ remainingTime }})
              </div>
              <b-progress-bar
                animated
                :value="remainingTime * (100 / availableTime)"
              />
            </b-progress>
          </b-col>
        </b-row>
        <b-row id="author-list">
          <author-card
            v-for="(author, idx) in game.authors"
            :key="`author-${idx}`"
            :author="author"
            :selected="author === chosenAuthor"
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
        <h3>Round {{ currentRoundIndex }}</h3>
        <template v-for="score in currentRoundScores">
          <b-alert
            :key="`score-${score.username}`"
            show
            :variant="scoreTypeNameToVariant(score.score_type_name)"
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
import { getUser } from '@/components/user'

interface Author {
  personnationality: string
  personcode: string
  personfullname: string
}

interface roundWithScores extends Index.rounds {
  // eslint-disable-next-line camelcase
  round_scores: Array<Index.round_scores>
}

interface gameWithRounds extends Index.games {
  rounds: Array<roundWithScores>
}

export default defineComponent({
  name: 'Game',
  components: { AuthorCard },
  setup() {
    const { $axios } = useContext()
    const { duckguessrId, username } = getUser()
    const route = useRoute()

    const chosenAuthor = ref(null as Author | null)

    const game = ref(null as gameWithRounds | null)
    let gameSocket: Socket | null = null

    // eslint-disable-next-line camelcase
    const currentRoundScores = ref([] as Array<Index.round_scores>)

    const hasUrlLoaded = ref(false as boolean)

    const now = ref(Date.now() as number)

    const gameIsFinished = computed(() => !nextRoundStartDate.value)

    const currentRoundIndex = computed((): number | null => {
      const lastUnfinishedRoundIndex = [...(game.value?.rounds || [])]
        .reverse()
        .findIndex(
          ({ started_at: startedAt }) =>
            startedAt && new Date(startedAt).getTime() < now.value
        )
      return lastUnfinishedRoundIndex === -1
        ? 0
        : (game.value?.rounds || []).length - lastUnfinishedRoundIndex
    })

    const currentRound = computed((): roundWithScores | null =>
      currentRoundIndex.value == null
        ? null
        : (game.value?.rounds || [])[currentRoundIndex.value]
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

    const remainingTimePercentage = computed(
      () => remainingTime.value * (100 / availableTime.value)
    )

    const nextRoundStartDate = computed(() => {
      const nextRound =
        currentRoundIndex.value == null
          ? null
          : game.value?.rounds[currentRoundIndex.value]
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
            gameSocket = io(
              `${process.env.SOCKET_URL}/game/${currentRound.game_id}`
            )
            gameSocket.on('playerGuessed', (data: any) => {
              currentRoundScores.value = [
                ...currentRoundScores.value.filter(
                  ({ round_id: roundNumber }) =>
                    roundNumber === currentRound.round_number
                ),
                data,
              ]
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
          setTimeout(async () => {
            game.value = await $axios.$get(`/api/game/${route.value.params.id}`)
            currentRoundScores.value =
              game.value!.rounds[currentRound.value!.round_number].round_scores
          }, 1000)
        }
      }
    )

    const validateGuess = () => {
      gameSocket!.emit('guess', { username }, currentRound.value!.id, {
        personcode: chosenAuthor.value?.personcode ?? null,
      })
      chosenAuthor.value = null
    }

    onMounted(async () => {
      game.value = await $axios.$get(`/api/game/${route.value.params.id}`)
      setInterval(() => {
        now.value = Date.now()
      }, 1000)
    })

    return {
      game,
      gameIsFinished,
      availableTime,
      remainingTime,
      remainingTimePercentage,
      chosenAuthor,
      hasUrlLoaded,
      currentRound,
      currentRoundIndex,
      currentRoundScores,
      currentRoundPlayerScoreTypeName: computed(
        () =>
          currentRoundScores.value.find(
            ({ player_id: playerId, round_id: roundNumber }) =>
              duckguessrId === playerId &&
              roundNumber === currentRound.value!.round_number
          )?.score_type_name || null
      ),
      nextRoundStartDate,
      validateGuess,
      url: computed(
        () =>
          currentRound.value &&
          `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${currentRound.value.sitecode_url}`
      ),
      progressbarVariant: computed(() => {
        if (remainingTimePercentage.value <= 20) {
          return 'danger'
        }
        if (remainingTimePercentage.value <= 40) {
          return 'warning'
        }
        return 'success'
      }),

      scoreTypeNameToVariant(scoreTypeName: string) {
        switch (scoreTypeName) {
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
</style>
