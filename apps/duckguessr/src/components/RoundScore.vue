<template>
  <b-progress
    v-if="inGame"
    :key="`score-${player.id}`"
    class="position-relative d-flex flex-row align-items-center justify-content-between mb-1 small"
  >
    <b-progress-bar
      v-if="roundDuration"
      class="position-absolute"
      :variant="alertVariant"
      :value="
        alertVariant === 'danger'
          ? 100
          : 100 - (100 * (score.timeSpentGuessing || 0)) / roundDuration
      "
      max="100"
    />
    <player-info :username="player.username" :top-player="false">
      <div
        v-if="score.scoreTypeName"
        class="text-center p-1 border border-dark"
        style="background-color: #e9ecef; height: initial"
      >
        {{ score.scoreTypeName }}
      </div>
    </player-info>
  </b-progress>
  <div v-else>
    <h6>{{ score.scoreTypeName }}</h6>
    <div>{{ score.score }} points</div>
    <small v-if="score.speedBonus">
      + <i-bi-stopwatch-fill /> {{ t("Speed bonus") }}: {{ score.speedBonus }}
    </small>
  </div>
</template>
<script lang="ts" setup>
import { useScoreToVariant } from "~/composables/use-score-to-variant";
import { OngoingRoundScore } from "~types/roundWithScoresAndAuthor";
import { player, roundScore } from "~duckguessr-api/types/prisma-client";

const { score, players } = toRefs(
  withDefaults(
    defineProps<{
      inGame: boolean;
      players: player[];
      score: roundScore | OngoingRoundScore;
      roundDuration: number | null;
    }>(),
    {
      inGame: false,
      roundDuration: null,
    }
  )
);

const alertVariant = computed(() => useScoreToVariant(score.value));
const player: player = players.value.find(
  ({ id }) => id === score.value.playerId
)!;

const { t } = useI18n();
</script>

<style scoped lang="scss">
.progress,
.progress > * {
  color: #555;
  height: 100px;
  line-height: 15px;

  * {
    font-size: small !important;
  }

  &.progress-bar {
    border-radius: 0.25rem;
  }
}
</style>
