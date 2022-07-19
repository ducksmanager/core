<template>
  <b-progress
    v-if="inGame"
    :key="`score-${player.id}`"
    class="position-relative d-flex flex-row align-items-center justify-content-between mb-1"
  >
    <b-progress-bar
      class="position-absolute"
      :variant="alertVariant"
      :value="
        alertVariant === 'danger' ? 100 : 100 - (100 * score.time_spent_guessing) / roundDuration
      "
      max="100"
    />
    <player-info :username="player.username" :top-player="false">
      <div
        v-if="score.score_type_name"
        class="text-center p-1 border border-dark"
        style="background-color: #e9ecef; height: initial"
      >
        {{ score.score_type_name }}
      </div>
    </player-info>
  </b-progress>
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
import { computed } from '@nuxtjs/composition-api'
import { useScoreToVariant } from '~/composables/use-score-to-variant'
import { OngoingRoundScore } from '~/types/roundWithScoresAndAuthor'

const props = withDefaults(
  defineProps<{
    inGame: boolean
    players: Index.player[]
    score: Index.round_score | OngoingRoundScore
    roundDuration: Number | null
  }>(),
  {
    inGame: false,
    roundDuration: null,
  }
)

const alertVariant = computed(() => useScoreToVariant(props.score))
const player: Index.player = props.players.find(({ id }) => id === props.score.player_id)!

const { t } = useI18n()
</script>

<style scoped lang="scss">
.progress,
.progress > * {
  color: #555;
  height: 100px;
  line-height: 15px;

  &.progress-bar {
    border-radius: 0.25rem;
  }
}
</style>
