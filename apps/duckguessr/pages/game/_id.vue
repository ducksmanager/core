<template>
  <b-container v-if="gameIsFinished" fluid>
    <b-alert show align="center" variant="info"> This game is finished. </b-alert>
    <game-scores :scores="game.rounds" :players="game.game_players" :authors="game.authors" />
  </b-container>
  <b-container v-else-if="!game || !currentRoundNumber" class="text-center">
    Loading...
  </b-container>
  <b-container v-else fluid class="overflow-hidden" style="height: 100vh">
    <round-result-modal
      v-if="currentRoundPlayerScore && currentRound.personcode"
      :status="scoreToVariant(currentRoundPlayerScore)"
      :speed-bonus="currentRoundPlayerScore.speed_bonus"
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
            <progress-bar :available-time="availableTime" :remaining-time="remainingTime" />
          </b-col>
        </b-row>
        <b-row id="author-list">
          <author-card
            v-for="(author, idx) in game.authors"
            :key="`author-${idx}`"
            :author="author"
            :selectable="
              !game.rounds.map(({ personcode }) => personcode).includes(author.personcode)
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
            class="d-flex flex-row p-1 align-items-center justify-content-between"
          >
            <user-info :username="getUsername(score.player_id)" />
            <div class="text-center">{{ score.score_type_name }}</div>
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
} from '@nuxtjs/composition-api'

import type Index from '@prisma/client'
import { io, Socket } from 'socket.io-client'
import Vue from 'vue'
import AuthorCard from '~/components/AuthorCard.vue'
import { getDuckguessrId } from '@/components/user'
import { Author, RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'
import { ClientToServerEvents, ServerToClientEvents } from '~/types/socketEvents'

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
  components: { AuthorCard },
  setup() {
    const { $axios } = useContext()
    const duckguessrId = getDuckguessrId()
    const route = useRoute()

    const chosenAuthor = ref(null as string | null)

    const game = ref(null as GameFull | null)
    let gameSocket: Socket<ServerToClientEvents, ClientToServerEvents>

    const currentRoundNumber = ref(null as number | null)

    const players = computed(
      (): Array<Index.player> =>
        game.value ? game.value.game_players.map(({ player }) => player) : []
    )

    const hasUrlLoaded = ref(false as boolean)

    const now = ref(Date.now() as number)

    const gameIsFinished = computed(
      () => game.value && !game.value!.rounds.find(({ personcode }) => !personcode)
    )

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
      if (!game) {
        console.error('No game ID')
      }
    }

    onMounted(async () => {
      await loadGame()

      gameSocket = io(`${process.env.SOCKET_URL}/game/${route.value.params.id}`, {
        auth: {
          cookie: document.cookie,
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

    const currentRoundScores = computed(() => {
      if (!currentRound.value) {
        return null
      }
      return game.value!.rounds[currentRoundNumber.value! - 1].round_scores
    })

    return {
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
      validateGuess,
      currentRoundScores,
      currentRoundPlayerScore: computed(() =>
        (currentRoundScores.value || []).find(
          ({ player_id: playerId }) => duckguessrId === playerId
        )
      ),
      url: computed(
        () =>
          currentRound.value &&
          `${process.env.CLOUDINARY_URL_ROOT}${currentRound.value.sitecode_url}`
      ),

      getUsername: (playerId: number) =>
        players.value.find(({ id }) => id === playerId)?.username || '?',

      getAuthor: (personcode2: string): Author =>
        game.value!.authors.find(({ personcode }) => personcode2 === personcode)!,

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
.alert {
  > *:nth-child(1) {
    width: 33%;
  }
  > *:nth-child(2) {
    width: 67%;
  }
}
</style>
