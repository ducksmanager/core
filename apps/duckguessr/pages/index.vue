<template>
  <b-container v-if="!urls">Loading...</b-container>
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
                v-for="(author, idx) in urls"
                :key="`author-${idx}`"
                cols="6"
                :class="{
                  author: true,
                  selected: author === chosenAuthor,
                  selectable:
                    urls.findIndex(
                      ({ personcode }) => personcode === author.personcode
                    ) >= currentStage,
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
                      :src="`https://www.countryflags.io/${author.nationalitycountrycode}/flat/16.png`"
                    />
                    {{ author.fullname }} ({{ author.plotwritartink }})
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
        <h4>Stage {{ currentStage + 1 }}/{{ stages }}</h4>
        <div
          v-for="score in scores"
          :key="`score-${score.stage}-${score.name}`"
          class="border p-2 m-2"
        >
          <h5>Stage {{ score.stage + 1 }}</h5>
          <template v-if="Object.keys(score.points).length">
            <div
              v-for="{ reason, value } in score.points"
              :key="`score-${score.stage}-${score.name}-${reason}`"
            >
              <h6>{{ reason }}</h6>
              <div>{{ value }} points</div>
            </div>
          </template>
          <div v-else>0 point</div>
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
} from '@nuxtjs/composition-api'

interface Author {
  nationalitycountrycode: string
  personcode: string
  fullname: string
}

interface Url {
  id: string
  url: string
  date: number
  plotwritartink: string
  personcode: string
  nationalitycountrycode: string
  firstpublicationdate: string
}

interface Score {
  stage: number
  user: string
  points: object
}

export default defineComponent({
  setup() {
    const { $axios } = useContext()

    const stages = 10

    const minDate = 1928
    const maxDate = new Date().getFullYear()
    const chosenDate = ref(parseInt('' + (maxDate + minDate) / 2))

    const currentStage = ref(0 as number)
    const chosenAuthor = ref(null as Author | null)

    const urls = ref(null as Array<Url> | null)

    const scores = reactive([] as Array<Score>)

    const hasUrlLoaded = ref(false as boolean)

    const validateGuess = () => {
      const currentUrlValue = urls.value![currentStage.value]
      const points = []
      debugger
      if (chosenAuthor.value != null) {
        if (chosenAuthor.value.personcode === currentUrlValue.personcode) {
          points.push({ reason: 'Correct author', value: 500 })
        } else if (
          chosenAuthor.value.nationalitycountrycode ===
          currentUrlValue.nationalitycountrycode
        ) {
          points.push({ reason: 'Correct nationality', value: 150 })
        }
      }

      const closeDatePoints = Math.max(
        0,
        500 - Math.pow(currentUrlValue.date - chosenDate.value, 3)
      )
      if (closeDatePoints > 0) {
        points.push({
          reason: 'Close date',
          value: closeDatePoints,
        })
      }

      scores.push({
        stage: currentStage.value,
        user: 'me',
        points,
      })
      chosenAuthor.value = null
      if (currentStage.value < stages - 1) {
        currentStage.value++
        remainingTime.value = 10
      }
    }

    const remainingTime = ref(10 as number)
    setInterval(() => {
      remainingTime.value = Math.max(0, remainingTime.value - 1)
    }, 1000)
    watch(
      () => remainingTime.value,
      (remainingTimeValue: Number) => {
        if (remainingTimeValue === 0) {
          validateGuess()
        }
      }
    )
    watch(
      () => currentStage.value,
      () => {
        hasUrlLoaded.value = false
      }
    )

    onMounted(async () => {
      urls.value = (await $axios.$get('/api/randomImage')).map(
        (url: { date: string }) => ({
          ...url,
          date: parseInt(url.date),
        })
      )
    })

    return {
      currentStage,
      stages,
      scores,
      minDate,
      maxDate,
      remainingTime,
      chosenDate,
      chosenAuthor,
      hasUrlLoaded,
      urls,
      dateTextTop: computed(
        () => 100 - (100 * (chosenDate.value - minDate)) / (maxDate - minDate)
      ),
      url: computed(() =>
        !urls.value
          ? null
          : `https://inducks.org/hr.php?image=https://outducks.org/thumbnails3/${
              urls.value[currentStage.value].url
            }&normalsize=1`
      ),
      validateGuess,
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

  + .slider-date {
    position: absolute;
    font-size: small;
    left: 50%;
    margin-top: -10px;
    padding-left: 15px;
  }
}
</style>
