<template>
  <div class="wrapper d-flex flex-column text-center">
    <div class="position-relative medal" :style="{ backgroundImage: medalUrl }">
      <div
        class="position-absolute overlay"
        :class="{ saturated: medalLevelAndProgress.level === 0 }"
        :style="{
          backgroundImage: previousMedalUrl,
          width: `${100 - shownLevelPercentage - currentLevelPercentageProgress}%`,
        }"
      />
    </div>
    <h6>{{ medalTypes[type].title }}</h6>
    <div class="small">{{ medalTypes[type].description }}</div>
    <div class="small text-white">
      &cross;
      {{ medalLevelAndProgress.currentLevelProgressPoints }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { MedalLevelAndProgress } from '~/types/playerStats'

const { t } = useI18n()
const medalTypes = computed(() => ({
  Americain: { title: t('US Expert'), description: t('You won a game guessing American authors') },
  Francais: { title: t('French Expert'), description: t('You won a game guessing French authors') },
  Italien: {
    title: t('Italian Expert'),
    description: t('You won a game guessing Italian authors'),
  },
  published_fr_recent: {
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
  medalLevelAndProgress: { type: MedalLevelAndProgress, required: true },
})

const shownLevelPercentage = computed(
  () => (props.medalLevelAndProgress.levelPercentage + 10) * 0.8
)

const currentLevelPercentageProgress = ref(0)
const isCurrentLevelPercentageProgressGoingUp = ref(true)

const medalColors = ['BRONZE', 'SILVER', 'GOLD']

const getMedalUrl = (level: number) =>
  `url('${process.env.NUXT_URL}/medals/256px/${props.type} ${medalColors[level]}.png')`

const medalUrl = computed(() => getMedalUrl(props.medalLevelAndProgress.level))

const previousMedalUrl = computed(() =>
  getMedalUrl(Math.max(0, props.medalLevelAndProgress.level - 1))
)

if (props.medalLevelAndProgress.levelPercentageProgress) {
  onMounted(() => {
    setInterval(() => {
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
    }, 50)
  })
}
</script>

<style scoped lang="scss">
.wrapper {
  width: 256px;

  .medal {
    width: 100%;
    height: 256px;
    background-size: cover;
    background-repeat: no-repeat;

    .overlay {
      height: 100%;
      background-position-x: right;
      background-size: cover;
      background-repeat: no-repeat;
      right: 0;

      &.saturated {
        filter: saturate(0%);
      }
    }
  }
}
</style>
