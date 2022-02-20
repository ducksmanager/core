<template>
  <div class="wrapper d-flex" :class="{ vertical }">
    <div class="username"><user-info :username="username" :top-player="topPlayer" /></div>
    <div
      class="progress bg-success d-inline-flex justify-content-center align-items-center"
      :style="{ [vertical ? 'height' : 'width']: score + 'px' }"
    >
      {{ score.toFixed(0) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerTotalScore',
  props: {
    username: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    topPlayer: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped lang="scss">
.wrapper {
  align-items: center;
  width: 100%;

  .progress {
    flex-direction: row;
    height: 25px;
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
