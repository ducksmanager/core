<template>
  <div class="wrapper d-flex flex-column text-center" :class="{ simple: !withDetails }">
    <div
      class="position-relative medal"
      :style="{ backgroundImage: nextMedalUrl }"
      :title="withTitle ? medalTitle : ''"
    >
      <div
        class="position-absolute overlay"
        :class="{ desaturated: medalLevelAndProgress.level === 0 }"
        :title="withTitle ? medalTitle : ''"
        :style="{
          backgroundImage: currentMedalUrl,
          'clip-path': `inset(0px 0px 0px ${
            shownLevelPercentage + currentLevelPercentageProgress
          }%)`,
        }"
      />
    </div>
    <div v-if="withDetails">
      <h6>
        {{ medalTypes[type].title }} <b-icon-info-circle-fill variant="info" :title="medalTitle" />
      </h6>

      <div class="small">{{ medalTypes[type].description }}</div>
    </div>
    <div v-if="withGameData" class="small text-white">
      &times;
      {{ medalLevelAndProgress.currentLevelProgressPoints }}&nbsp;
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { BIconInfoCircleFill } from 'bootstrap-vue'
import { MedalLevelAndProgress } from '~/types/playerStats'
import { MEDAL_LEVELS } from '~/store/user'

const { t } = useI18n()
const medalTypes = computed((): { [key: string]: any } => ({
  Francais: { title: t('French Expert'), description: t('You won a game guessing French authors') },
  it: {
    title: t('Italian Expert'),
    description: t('You won a game guessing Italian authors'),
  },
  'published-fr-recent': {
    title: t('French Publications Expert'),
    description: t('You won a game guessing authors from French publications'),
  },
  fast: { title: t('Fast'), description: t('You guessed a drawing in less than 5 seconds') },
  ultra_fast: {
    title: t('Super Fast'),
    description: t('You guessed a drawing in less than 2 seconds'),
  },
  us: { title: t('US Expert'), description: t('You won a game guessing American authors') },
}))

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  withGameData: {
    type: Boolean,
    default: false,
  },
  withDetails: {
    type: Boolean,
    default: false,
  },
  withTitle: {
    type: Boolean,
    default: true,
  },
  medalLevelAndProgress: { type: MedalLevelAndProgress, required: true },
})

const levels = computed(
  () => MEDAL_LEVELS.find(({ medalType }) => medalType === props.type!)!.levels
)

const currentLevelThreshold = computed(() =>
  props.medalLevelAndProgress.level === 0 ? 0 : levels.value[props.medalLevelAndProgress.level - 1]
)
const nextLevelThreshold = computed(() => levels.value[props.medalLevelAndProgress.level])

const totalPointsToReachNextLevel = computed(
  () => nextLevelThreshold.value - currentLevelThreshold.value
)

const levelPercentage = computed(
  () => (100 * props.medalLevelAndProgress.currentLevelPoints) / totalPointsToReachNextLevel.value
)

const shownLevelPercentage = computed(() => (levelPercentage.value + 15) / 1.5)

const levelPercentageProgress = computed(
  () =>
    (100 * props.medalLevelAndProgress.currentLevelProgressPoints) /
    totalPointsToReachNextLevel.value
)

const medalTitle = computed(() => {
  let title = medalTypes.value[props.type].title
  if (props.medalLevelAndProgress.level > 0) {
    title += ` - ${t(medalColors[props.medalLevelAndProgress.level - 1])}`
  }
  title += '\n'
  if (props.withGameData) {
    title +=
      t(`+ {newPoints} point(s)`, {
        newPoints: props.medalLevelAndProgress.currentLevelProgressPoints,
      }) + '\n'
  }
  if (props.medalLevelAndProgress.level < 3) {
    const nextLevel = props.medalLevelAndProgress.level
    const pointsToNextThreshold =
      totalPointsToReachNextLevel.value -
      (props.medalLevelAndProgress.currentLevelPoints +
        props.medalLevelAndProgress.currentLevelProgressPoints)
    if (isNaN(pointsToNextThreshold)) {
      console.error(
        JSON.stringify({
          totalPointsToReachNextLevel: totalPointsToReachNextLevel.value,
          currentLevelPoints: props.medalLevelAndProgress.currentLevelPoints,
          currentLevelProgressPoints: props.medalLevelAndProgress.currentLevelProgressPoints,
        })
      )
    }
    title += t(`Earn {pointsToNextThreshold} more points to get the {nextMedal} medal`, {
      pointsToNextThreshold,
      nextMedal: t(medalColors[nextLevel]),
    })
  }
  return title
})

const currentLevelPercentageProgress = ref(0)
const isCurrentLevelPercentageProgressGoingUp = ref(true)

const medalColors = ['Bronze', 'Silver', 'Gold']

const getMedalUrl = (level: number) =>
  `url('${process.env.NUXT_URL}/medals/256px/${props.type} ${medalColors[
    Math.max(0, level - 1)
  ].toUpperCase()}.png')`

const currentMedalUrl = computed(() => getMedalUrl(Math.max(0, props.medalLevelAndProgress.level)))
const nextMedalUrl = computed(() => getMedalUrl(Math.min(3, props.medalLevelAndProgress.level + 1)))

onMounted(() => {
  console.log(
    `Type: ${props.type}, Current level and progress: ${JSON.stringify(
      props.medalLevelAndProgress
    )}`
  )
  setInterval(() => {
    if (!props.withGameData) {
      currentLevelPercentageProgress.value = levelPercentageProgress.value
    } else if (levelPercentageProgress.value) {
      const increment = levelPercentageProgress.value / 20
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= levelPercentageProgress.value
      ) {
        isCurrentLevelPercentageProgressGoingUp.value =
          !isCurrentLevelPercentageProgressGoingUp.value
      }
      currentLevelPercentageProgress.value +=
        increment * (isCurrentLevelPercentageProgressGoingUp.value ? 1 : -1)
    }
  }, 50)
})
</script>

<style scoped lang="scss">
.wrapper {
  width: 192px;

  &.simple {
    width: initial;

    .medal {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 100%;

      .overlay {
        height: 100%;
      }
    }
  }

  .medal {
    width: 100%;
    height: 192px;
    background-size: contain;
    background-repeat: no-repeat;

    .overlay {
      width: 100%;
      height: 192px;
      background-position-x: right;
      background-size: contain;
      background-repeat: no-repeat;
      right: 0;

      &.desaturated {
        filter: saturate(0%);
      }
    }
  }
}
</style>
