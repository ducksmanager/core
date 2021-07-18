<template>
  <b-container v-if="!game">Loading...</b-container>
  <b-container v-else-if="game.finished_at"
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
          <b-col
            v-for="(author, idx) in game.authors"
            :key="`author-${idx}`"
            cols="4"
            :class="{
              author: true,
              selected: author === chosenAuthor,
              selectable:
                game.authors.findIndex(
                  ({ personcode }) => personcode === author.personcode
                ) >= currentRound.roundNumber,
              'p-1': true,
            }"
            @click="
              chosenAuthor = author
              validateGuess()
            "
          >
            <div
              class="author-image"
              :style="{
                'background-image': `url('https://inducks.org/creators/photos/${author.personcode}.jpg')`,
              }"
            >
              <div
                class="position-absolute"
                style="bottom: 10px; background: rgba(255, 255, 255, 0.5)"
              >
                <b-img
                  :src="`https://www.countryflags.io/${author.personnationality}/flat/16.png`"
                />
                {{ author.personfullname }} ({{ author.personrole }})
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="2" class="border vh-100 overflow-auto">
        <h3>Scores</h3>
        <h4>Round {{ currentRound.roundNumber + 1 }}/{{ rounds }}</h4>
        <round-scores
          :scores="game.rounds[currentRound.roundNumber].round_scores"
        />
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

import { games, rounds } from '@prisma/client'
import { io, Socket } from 'socket.io-client'

interface Author {
  personnationality: string
  personcode: string
  personfullname: string
  personrole: string
}

interface Score {
  stage: number
  user: string
  points: object
}

interface roundWithImage extends rounds {
  base64: string
  guessed: boolean
}

export default defineComponent({
  name: 'Game',
  setup() {
    const { $axios } = useContext()
    const route = useRoute()

    const rounds = 9

    const currentRound = ref(null as roundWithImage | null)
    const chosenAuthor = ref(null as Author | null)

    const game = ref(null as games | null)
    let gameSocket: Socket | null = null

    const scores = reactive([] as Array<Score>)
    const username = ref('player1' as string)

    const hasUrlLoaded = ref(false as boolean)

    const validateGuess = () => {
      currentRound.value!.guessed = true
      gameSocket!.emit('guess', {
        username: username.value,
        guess: {
          personcode: chosenAuthor.value?.personcode ?? null,
          personnationality: chosenAuthor.value?.personnationality ?? null,
        },
      })
    }

    const finishRound = async () => {
      scores.push(
        (await $axios.$post(`/api/round/${game.value!.id}/finish`)).roundScores
      )
    }

    const availableTime = 10
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
          finishRound()
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
      } else if (!gameData.finished_at) {
        currentRound.value = await $axios.$get(`/api/round/${gameData.id}`)
        setInterval(() => {
          remainingTime.value = Math.max(0, remainingTime.value - 1)
        }, 1000)
        gameSocket = io(`${process.env.SOCKET_URL}/game/${gameData.id}`)
        gameSocket.on('guess', (otherPlayerScore: any) => {
          console.debug(otherPlayerScore)
        })
      }
    })

    return {
      game,
      gameSocket,
      rounds,
      scores,
      availableTime,
      remainingTime,
      remainingTimePercentage,
      chosenAuthor,
      hasUrlLoaded,
      currentRound,
      url: computed(() => currentRound.value && currentRound.value.base64),
      progressbarVariant: computed(() => {
        if (remainingTimePercentage.value <= 20) {
          return 'danger'
        }
        if (remainingTimePercentage.value <= 40) {
          return 'warning'
        }
        return 'success'
      }),

      validateGuess,
      finishRound,
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
}

.author {
  font-size: 12px;
  border-radius: 5px;
  pointer-events: none;

  .author-image {
    background-size: cover;
    background-position: center;
    height: 100%;
    border-radius: 5px;
    opacity: 0.2;
  }

  &.selectable {
    cursor: pointer;
    pointer-events: all;

    &:hover {
      outline: 1px solid lightgray;
    }

    &.selected {
      outline: 1px solid black;
    }

    .author-image {
      opacity: 1;
    }
  }
}
</style>
