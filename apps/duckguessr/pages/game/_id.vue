<template>
  <b-container v-if="!currentRound">Loading...</b-container>
  <b-container v-else fluid class="overflow-hidden" style="height: 100vh">
    <b-row>
      <b-col cols="10" align-self="center">
        <b-row align-v="center">
          <b-col cols="6">
            <b-img center :src="url" @load="hasUrlLoaded = true" />
          </b-col>
          <b-col cols="3">
            <b-row align-v="center" style="height: 50px">
              <b-col class="text-center"><h4>Guess the author!</h4></b-col>
            </b-row>
            <b-row id="author-list">
              <b-col
                v-for="(author, idx) in game.authors"
                :key="`author-${idx}`"
                cols="6"
                :class="{
                  author: true,
                  selected: author === chosenAuthor,
                  selectable:
                    game.authors.findIndex(
                      ({ personcode }) => personcode === author.personcode
                    ) >= currentRound.roundNumber,
                  'p-1': true,
                }"
                @click="chosenAuthor = author"
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
          <b-col cols="3">
            <b-row align-v="center" style="height: 50px">
              <b-col class="text-center"
                ><h4>Guess the first publication date!</h4></b-col
              >
            </b-row>
            <b-row align-v="center" id="date-picker">
              <b-col class="text-center" style="height: 100%">
                <b-input
                  orient="vertical"
                  :value="chosenDate"
                  type="range"
                  min="1928"
                  max="2021"
                  @input="chosenDate = parseInt($event)"
                />
                <div class="slider-date" :style="{ top: dateTextTop + '%' }">
                  {{ chosenDate }}
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row align-v="end" style="height: 50px">
          <b-col offset="6" class="text-center p-0">
            <b-btn
              :disabled="remainingTime === 0"
              @click="validateGuess"
              style="width: 100%"
              >Validate guess ({{ remainingTime }})
            </b-btn>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="2" class="border vh-100 overflow-auto">
        <h3>Scores</h3>
        <h4>Round {{ currentRound.roundNumber + 1 }}/{{ stages }}</h4>
        <div
          v-for="pastRound in pastRounds"
          :key="`score-${pastRound.round_number}-${pastRound.name}`"
          class="border p-2 m-2"
        >
          <h5>Stage {{ pastRound.stage + 1 }}</h5>
          <!--          <template v-if="Object.keys(score.points).length">-->
          <!--            <div-->
          <!--              v-for="{ reason, value } in score.points"-->
          <!--              :key="`score-${score.stage}-${score.name}-${reason}`"-->
          <!--            >-->
          <!--              <h6>{{ reason }}</h6>-->
          <!--              <div>{{ value }} points</div>-->
          <!--            </div>-->
          <!--          </template>-->
          <!--          <div v-else>0 point</div>-->
        </div>
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
  setup() {
    const { $axios } = useContext()
    const route = useRoute()

    const stages = 10

    const minDate = 1928
    const maxDate = new Date().getFullYear()
    const chosenDate = ref(parseInt('' + (maxDate + minDate) / 2))

    const currentRound = ref(null as roundWithImage | null)
    const chosenAuthor = ref(null as Author | null)

    const game = ref(null as games | null)

    const scores = reactive([] as Array<Score>)

    const hasUrlLoaded = ref(false as boolean)

    const validateGuess = async () => {
      currentRound.value!.guessed = true
      await $axios.$post(`/api/round/${game.value!.id}/guess`, {
        guess: {
          personcode: chosenAuthor.value?.personcode ?? null,
          personnationality: chosenAuthor.value?.personnationality ?? null,
          firstpublicationyear: chosenDate.value,
        },
      })
    }

    const finishRound = async () => {
      scores.push(
        (await $axios.$post(`/api/round/${game.value!.id}/finish`)).roundScores
      )
    }

    const remainingTime = ref(10 as number)
    setInterval(() => {
      remainingTime.value = Math.max(0, remainingTime.value - 1)
    }, 1000)
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
      game.value = await $axios.$get(`/api/game/${route.value.params.id}`)
      if (!game.value) {
        console.error('No game ID')
      } else {
        currentRound.value = await $axios.$get(`/api/round/${game.value.id}`)
      }
    })

    return {
      game,
      stages,
      scores,
      minDate,
      maxDate,
      remainingTime,
      chosenDate,
      chosenAuthor,
      hasUrlLoaded,
      currentRound,
      dateTextTop: computed(
        () => 100 - (100 * (chosenDate.value - minDate)) / (maxDate - minDate)
      ),
      url: computed(() => currentRound.value && currentRound.value.base64),
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

#author-list,
#date-picker {
  height: calc(100vh - 100px);
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

input[type='range'][orient='vertical'] {
  background: #666;
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  width: 8px;
  height: 100%;
  padding: 0 5px;
  border-radius: 5px;

  + .slider-date {
    position: absolute;
    font-size: small;
    left: 50%;
    margin-top: -10px;
    padding-left: 15px;
  }
}
</style>
