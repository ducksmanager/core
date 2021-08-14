<template>
  <b-container
    v-if="!game || (!currentRound && !gameIsFinished)"
    class="text-center"
    >Loading...</b-container
  >
  <b-container v-else-if="gameIsFinished" fluid
    ><b-alert show align="center" variant="info"
      >This game is finished.</b-alert
    >
    <game-scores :scores="game.rounds" />
  </b-container>
  <b-container v-else fluid class="overflow-hidden" style="height: 100vh">
    <b-row>
      <b-col cols="5" align-self="center">
        <b-img center :src="url" @load="hasUrlLoaded = true" />
      </b-col>
      <b-col cols="5" class="h-100">
        <b-row align-v="center" style="height: 50px">
          <b-col class="text-center"
            ><b-progress :variant="progressbarVariant">
              <div class="position-absolute pt-2 w-100">
                Guess the author! ({{ remainingTime }})
              </div>
              <b-progress-bar
                animated
                :value="remainingTime * (100 / availableTime)" /></b-progress
          ></b-col>
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
        <h3>Round scores</h3>
        <template v-for="score in currentRoundScores">
          <b-alert
            :key="`score-${score.player_id}`"
            show
            :variant="scoreTypeNameToVariant(score.score_type_name)"
            >{{ score.player_id }}: {{ score.score_type_name }}</b-alert
          >
        </template>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  useContext,
  watch,
  onMounted,
  useRoute,
} from '@nuxtjs/composition-api'

import type Index from '@prisma/client'
import { io, Socket } from 'socket.io-client'
import AuthorCard from '~/components/AuthorCard.vue'

interface Author {
  personnationality: string
  personcode: string
  personfullname: string
}

interface Score {
  // eslint-disable-next-line camelcase
  player_id: number
  score: string
  // eslint-disable-next-line camelcase
  score_type_name: object
}

interface roundWithGuessedFlag extends Index.rounds {
  guessed: boolean
}

export default defineComponent({
  name: 'Game',
  components: { AuthorCard },
  setup() {
    const { $axios } = useContext()
    const route = useRoute()

    const rounds = 8

    const gameIsFinished = ref(false as Boolean)
    const currentRound = ref(null as roundWithGuessedFlag | null)
    const chosenAuthor = ref(null as Author | null)

    const game = ref(null as Index.games | null)
    let gameSocket: Socket | null = null

    const currentRoundScores = reactive([] as Array<Score>)

    const hasUrlLoaded = ref(false as boolean)

    const validateGuess = () => {
      currentRound.value!.guessed = true
      gameSocket!.emit('guess', {
        username: sessionStorage.getItem('username'),
        guess: {
          personcode: chosenAuthor.value?.personcode ?? null,
          personnationality: chosenAuthor.value?.personnationality ?? null,
        },
      })
    }

    const availableTime = 1000
    const remainingTime = ref(availableTime as number)
    const remainingTimePercentage = computed(
      () => remainingTime.value * (100 / availableTime)
    )
    watch(
      () => remainingTime.value,
      (remainingTimeValue: Number) => {
        if (remainingTimeValue === 0) {
          if (!currentRound.value!.guessed) {
            validateGuess()
          }
        }
      }
    )
    watch(
      () => currentRound.value,
      () => {
        hasUrlLoaded.value = false
      }
    )

    onMounted(async () => {
      const gameData = await $axios.$get(`/api/game/${route.value.params.id}`)
      game.value = gameData
      if (!gameData) {
        console.error('No game ID')
      } else if (new Date(gameData.finished_at) > new Date()) {
        currentRound.value = [...gameData.rounds]
          .reverse()
          .find(({ finished_at: finishedAt }) => finishedAt < new Date())
        setInterval(() => {
          remainingTime.value = Math.max(0, remainingTime.value - 1)
        }, 1000)
        gameSocket = io(`${process.env.SOCKET_URL}/game/${gameData.id}`)
        gameSocket.on('playerGuessed', (data: any) => {
          currentRoundScores.push(data)
        })
      } else {
        gameIsFinished.value = true
      }
    })

    return {
      game,
      gameIsFinished,
      gameSocket,
      rounds,
      availableTime,
      remainingTime,
      remainingTimePercentage,
      chosenAuthor,
      hasUrlLoaded,
      currentRound,
      currentRoundScores,
      url: computed(
        () =>
          currentRound.value &&
          `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${currentRound.value.entryurl_url}`
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

      scoreTypeNameToVariant: (scoreTypeName: string) => {
        switch (scoreTypeName) {
          case 'Correct author':
            return 'success'
          case 'Correct nationality':
            return 'warning'
          default:
            return 'danger'
        }
      },

      validateGuess,
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
