<template>
  <div class="wrapper d-flex" :class="{ vertical }">
    <div class="username">
      <player-info :username="username" :top-player="topPlayer" />
    </div>
    <div
      class="progress bg-success d-inline-flex justify-content-center align-items-center"
      :class="rank === null ? null : { [`rank-${rank}`]: true }"
      :style="{ [vertical ? 'height' : 'width']: `${barSizePct}%` }"
    >
      {{ score.toFixed(0) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    username: string
    score: number
    maxScoreAllPlayers: number
    vertical: boolean
    topPlayer: boolean
    rank: number | null
  }>(),
  {
    rank: null,
  }
)

const barSizePct = (100 * props.score) / props.maxScoreAllPlayers
</script>

<style scoped lang="scss">
.wrapper {
  align-items: center;
  justify-content: center;

  .progress {
    flex-direction: row;
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
    }
  }
}
</style>
