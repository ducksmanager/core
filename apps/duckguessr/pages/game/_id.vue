<template>
  <b-container v-if="gameIsFinished" fluid>
    <b-alert show align="center" variant="info">
      This game is finished.
    </b-alert>
    <game-scores
      :scores="game.rounds"
      :players="game.game_players"
      :authors="game.authors"
    />
  </b-container>
  <b-container v-else-if="!game || !currentRoundNumber" class="text-center">
    Loading...
  </b-container>
  <b-container v-else fluid class="overflow-hidden" style="height: 100vh">
    <round-result-modal
      v-if="currentRound.personcode"
      :status="scoreToVariant(currentRoundPlayerScore)"
      :correct-author="getAuthor(currentRound.personcode)"
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
            :key="`score-${score.player_id}`"
            show
            :variant="scoreToVariant(score)"
          >
            {{ getUsername(score.player_id) }}:
            {{ score.score_type_name }}
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
import {
  Author,
  RoundWithScoresAndAuthor,
} from '~/types/roundWithScoresAndAuthor'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '~/types/socketEvents'

interface GamePlayerWithFullPlayer extends Index.game_player {
  player: Index.player
}

interface GameFull extends Index.game {
  authors: Array<Author>
  rounds: Array<RoundWithScoresAndAuthor>
  game_players: Array<GamePlayerWithFullPlayer>
}

export default defineComponent({
  name: 'Game',
  components: { AuthorCard, ProgressBar },
  setup() {
    const { $axios } = useContext()
    const { duckguessrId, username } = getUser()
    const route = useRoute()

    const chosenAuthor = ref(null as string | null)

    const game = ref(null as GameFull | null)
    let gameSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
      null

    const currentRoundScores = ref([] as Array<Index.round_score>)

    const players = computed(
      (): Array<Index.player> =>
        game.value ? game.value.game_players.map(({ player }) => player) : []
    )

    const hasUrlLoaded = ref(false as boolean)

    const now = ref(Date.now() as number)

    const gameIsFinished = computed(() => game.value?.id && !currentRound.value)

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
    ): RoundWithScoresAndAuthor | null =>
      searchedRoundNumber == null
        ? null
        : (game.value?.rounds || []).find(
            ({ round_number: roundNumber }) =>
              roundNumber === searchedRoundNumber
          ) || null

    const previousRound = computed((): RoundWithScoresAndAuthor | null =>
      getRound(currentRoundNumber.value! - 1)
    )

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
      (newCurrentRound, previousRound) => {
        hasUrlLoaded.value = false
        if (newCurrentRound) {
          if (!gameSocket) {
            gameSocket = io(`${process.env.SOCKET_URL}/game/${game.value!.id}`)
            gameSocket.on('playerGuessed', (data) => {
              const { answer } = data
              currentRoundScores.value = [...currentRoundScores.value, data]
              if (answer) {
                currentRound.value!.personcode = answer
              }
            })
          }
          if (newCurrentRound.round_number !== previousRound?.round_number) {
            currentRoundScores.value = []
          }
        }
      }
    )

    watch(
      () => remainingTime.value,
      (remainingTimeValue: number) => {
        if (remainingTimeValue <= 0) {
          chosenAuthor.value = null
          setTimeout(async () => {
            await loadGame()
            currentRoundScores.value = currentRound.value!.round_scores
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
      players,
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

      getUsername: (playerId: number) =>
        players.value.find(({ id }) => id === playerId)?.username || '?',

      getAuthor: (personcode2: string): Author =>
        game.value!.authors.find(
          ({ personcode }) => personcode2 === personcode
        )!,

      scoreToVariant(roundScore: Index.round_score | null) {
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
