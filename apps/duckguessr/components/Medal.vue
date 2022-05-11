<template>
  <div class="wrapper d-flex flex-column text-center">
    <div v-if="level > 0" class="position-relative medal" :style="{ backgroundImage: medalUrl }">
      <div
        class="position-absolute overlay"
        :style="{
          backgroundImage: medalUrl,
          width: `${100 - levelPercentage - currentLevelPercentageProgress}%`,
        }"
      />
    </div>
    <h6>{{ medalTypes[type].title }}</h6>
    <div class="small">{{ medalTypes[type].description }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'

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
  Rapide: { title: t('Fast'), description: t('You guessed a drawing in less than 4 seconds') },
  Super_Rapide: {
    title: t('Super Fast'),
    description: t('You guessed a drawing in less than 2 seconds'),
  },
}

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  level: { type: Number, required: true, validator: (prop: number) => [0, 1, 2, 3].includes(prop) },
  levelPercentage: { type: Number, default: 100 },
  levelPercentageProgress: { type: Number, default: 0 },
})

const currentLevelPercentageProgress = ref(0)
const currentLevelPercentageProgressGoingUp = ref(true)

const fileName = computed(
  () => `${props.type} ${props.level === 1 ? 'BRONZE' : props.level === 2 ? 'ARGENT' : 'OR'}.png`
)

const medalUrl = computed(() => `url('${process.env.NUXT_URL}/medals/256px/${fileName.value}'`)

if (props.levelPercentageProgress) {
  onMounted(() => {
    setInterval(() => {
      const increment = props.levelPercentageProgress / 20
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= props.levelPercentageProgress
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
