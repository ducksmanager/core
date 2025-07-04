<template>
  <div
    class="wrapper d-flex"
    :class="{ vertical }"
    :style="vertical ? {} : { 'min-height': `${size * 1.75}rem` }"
  >
    <div
      v-if="rank >= 3"
      :style="{ 'font-size': `${1 - 0.1 * (4 - size)}rem` }"
    >
      {{ rank + 1 }}.
    </div>
    <div class="username">
      <player-info
        no-right-panel
        :nowrap="false"
        :size="size"
        :username="currentPlayer.username"
        :avatar="currentPlayer.avatar"
        :top-player="topPlayer"
      />
    </div>
    <div
      :class="`progress bg-success d-inline-flex justify-content-center align-items-center rank-${rank}`"
      :style="{ [vertical ? 'height' : 'width']: `${barSizePct}%` }"
    >
      {{ currentPlayer.sumScore.toFixed(0) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PlayerWithSumScore } from "~duckguessr-types/playerStats";
const { currentPlayer, maxScoreAllPlayers, rank } = defineProps<{
  currentPlayer: PlayerWithSumScore;
  maxScoreAllPlayers: number;
  vertical: boolean;
  topPlayer: boolean;
  rank: number;
}>();

const barSizePct = computed(
  () => (100 * currentPlayer.sumScore) / maxScoreAllPlayers,
);

const size = computed(() => (rank < 3 ? 4 : rank < 10 ? 3 : rank < 20 ? 2 : 1));
</script>

<style scoped lang="scss">
.wrapper {
  align-items: center;
  justify-content: center;

  height: 80px;
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
