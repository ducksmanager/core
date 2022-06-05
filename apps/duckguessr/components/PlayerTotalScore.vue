<template>
  <div class="wrapper d-flex" :class="{ vertical: vertical }">
    <div class="username">
      <player-info :username="player.username" :avatar="player.avatar" :top-player="topPlayer" />
    </div>
    <div
      :class="`progress bg-success d-inline-flex justify-content-center align-items-center rank-${rank}`"
      :style="{ [vertical ? 'height' : 'width']: `${barSizePct}%` }"
    >
      {{ player.sum_score.toFixed(0) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PlayerWithSumScore } from '~/types/playerStats'

const playerTotalScoreProps = withDefaults(
  defineProps<{
    player: PlayerWithSumScore
    maxScoreAllPlayers: number
    vertical: boolean
    topPlayer: boolean
    rank: number | null
  }>(),
  {
    rank: null,
  }
)

const barSizePct =
  (100 * playerTotalScoreProps.player.sum_score) / playerTotalScoreProps.maxScoreAllPlayers
</script>

<style scoped lang="scss">
.wrapper {
  align-items: center;
  justify-content: center;

  height: 110px;
  width: 250px;

  .progress {
    flex-direction: row;
    min-width: 30px;
    height: 25px;

    &.rank-0 {
      background-color: #c9b037 !important;
    }

    &.rank-1 {
      background-color: #d7d7d7 !important;
    }

    &.rank-2 {
      background-color: #ad8a56 !important;
    }
  }

  .username {
    width: 100px;
    height: initial;
    justify-content: center;
  }

  &.vertical {
    flex-direction: column;
    width: 110px;
    height: 250px;

    .username {
      width: 100%;
      height: 100%;
      text-align: center;
    }

    .progress {
      flex-direction: row;
      width: 90%;
      min-height: 16px;
    }
  }
}
</style>
