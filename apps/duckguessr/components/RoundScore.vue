<template>
  <b-alert
    v-if="inGame"
    :key="`score-${player.id}`"
    show
    :variant="alertVariant"
    class="d-flex flex-row p-1 align-items-center justify-content-between"
  >
    <b-col cols="4" class="px-0">
      <player-info :username="player.username" :top-player="false" />
    </b-col>
    <b-col cols="8">
      <div class="text-center">{{ score.score_type_name }}</div>
    </b-col>
  </b-alert>
  <div v-else>
    <h6>{{ score.score_type_name }}</h6>
    <div>{{ score.score }} points</div>
    <small v-if="score.speedBonus">
      + <b-icon-stopwatch-fill /> {{ t('Speed bonus') }}: {{ score.speedBonus }}
    </small>
  </div>
</template>
<script lang="ts" setup>
import { BIconStopwatchFill } from 'bootstrap-vue'
import Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'
import { useScoreToVariant } from '~/composables/use-score-to-variant'

const props = withDefaults(
  defineProps<{
    inGame: boolean
    players: Index.player[]
    score: Index.round_score
  }>(),
  {
    inGame: false,
  }
)

const alertVariant = useScoreToVariant(props.score)
const player: Index.player = props.players.find(({ id }) => id === props.score.player_id)!

const { t } = useI18n()
</script>

<style scoped></style>
