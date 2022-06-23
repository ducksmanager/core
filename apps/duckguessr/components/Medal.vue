<template>
  <div class="wrapper d-flex flex-column text-center" :class="{ simple: !withDetails }">
    <div class="position-relative medal" :style="{ backgroundImage: medalUrl }" :title="medalTitle">
      <div
        class="position-absolute overlay"
        :class="{ desaturated: medalLevelAndProgress.level === 0 }"
        :style="{
          backgroundImage: previousMedalUrl,
          width: `${100 - shownLevelPercentage - currentLevelPercentageProgress}%`,
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
  Americain: { title: t('US Expert'), description: t('You won a game guessing American authors') },
  Francais: { title: t('French Expert'), description: t('You won a game guessing French authors') },
  Italien: {
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
  medalLevelAndProgress: { type: MedalLevelAndProgress, required: true },
})

const shownLevelPercentage = computed(
  () => (props.medalLevelAndProgress.levelPercentage + 15) / 1.5
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
      MEDAL_LEVELS.find((medalLevel) => medalLevel.medalType === props.type!)!.levels[nextLevel] -
      props.medalLevelAndProgress.currentLevelPoints -
      props.medalLevelAndProgress.currentLevelProgressPoints
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
    level
  ].toUpperCase()}.png')`

const medalUrl = computed(() => {
  console.log(`Current level and progress: ${JSON.stringify(props.medalLevelAndProgress)}`)
  return getMedalUrl(props.medalLevelAndProgress.level)
})

const previousMedalUrl = computed(() =>
  getMedalUrl(Math.max(0, props.medalLevelAndProgress.level - 1))
)

onMounted(() => {
  setInterval(() => {
    if (!props.withGameData) {
      currentLevelPercentageProgress.value = props.medalLevelAndProgress.levelPercentageProgress
    } else if (props.medalLevelAndProgress.levelPercentageProgress) {
      const increment = props.medalLevelAndProgress.levelPercentageProgress / 20
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= props.medalLevelAndProgress.levelPercentageProgress
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
    }
  }

  .medal {
    width: 100%;
    height: 192px;
    background-size: cover;
    background-repeat: no-repeat;

    .overlay {
      height: 100%;
      background-position-x: right;
      background-size: cover;
      background-repeat: no-repeat;
      right: 0;

      &.desaturated {
        filter: saturate(0%);
      }
    }
  }
}
</style>
