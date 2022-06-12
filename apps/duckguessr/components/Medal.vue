<template>
  <div class="wrapper d-flex flex-column text-center">
    <div class="position-relative medal" :style="{ backgroundImage: medalUrl }">
      <div
        class="position-absolute overlay"
        :style="{
          backgroundImage: medalUrl,
          width: `${100 - medalLevelAndProgress.levelPercentage - currentLevelPercentageProgress}%`,
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
const medalTypes = {
  Americain: { title: t('US Expert'), description: t('You won a game guessing American authors') },
  Francais: { title: t('French Expert'), description: t('You won a game guessing French authors') },
  Italien: {
    title: t('Italian Expert'),
    description: t('You won a game guessing Italian authors'),
  },
  Magazine_Francais: {
    title: t('French Publications Expert'),
    description: t('You won a game guessing authors from French publications'),
  },
  fast: { title: t('Fast'), description: t('You guessed a drawing in less than 5 seconds') },
  ultra_fast: {
    title: t('Super Fast'),
    description: t('You guessed a drawing in less than 2 seconds'),
  },
}

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  medalLevelAndProgress: { type: Object as () => MedalLevelAndProgress, required: true },
})

const currentLevelPercentageProgress = ref(0)
const currentLevelPercentageProgressGoingUp = ref(true)

const fileName = computed(
  () =>
    `${props.type} ${
      props.medalLevelAndProgress.level === 0
        ? 'BRONZE'
        : props.medalLevelAndProgress.level === 1
        ? 'SILVER'
        : 'GOLD'
    }.png`
)

const medalUrl = computed(() => `url('${process.env.NUXT_URL}/medals/256px/${fileName.value}'`)

if (props.medalLevelAndProgress.levelPercentageProgress) {
  onMounted(() => {
    setInterval(() => {
      const increment = props.medalLevelAndProgress.levelPercentageProgress / 20
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= props.medalLevelAndProgress.levelPercentageProgress
      ) {
        currentLevelPercentageProgressGoingUp.value = !currentLevelPercentageProgressGoingUp.value
      }
      currentLevelPercentageProgress.value +=
        increment * (currentLevelPercentageProgressGoingUp.value ? 1 : -1)
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
      filter: saturate(0%);
      background-position-x: right;
      background-size: cover;
      background-repeat: no-repeat;
      right: 0;
    }
  }
}
</style>
