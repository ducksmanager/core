<template>
  <div class="d-flex flex-column" :class="{ vertical }">
    <div class="username">{{ username }}</div>
    <b-progress show-value variant="success" :max="score" :style="{ width: score }">
      <b-progress-bar :value="score" />
    </b-progress>
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
  },
}
</script>

<style scoped lang="scss">
.vertical {
  width: 110px;
  height: 200px;
  .username {
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .progress {
    height: 200px;
    transform: rotate(-90deg);
    align-self: center;
  }
}

.progress {
  width: 200px;
}
</style>
