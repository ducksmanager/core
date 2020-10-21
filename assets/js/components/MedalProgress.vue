<template>
  <span>
    <img
      v-if="currentLevel > 0"
      :class="{medal: true, target: true, left: true }"
      :src="`${imagePath}/medals/${type}_${currentLevel}_fond.png`"
      :alt="currentLevel"
    >
    <img
      v-if="currentLevel < 3"
      :class="{medal: true, target: true, right: true }"
      :src="`${imagePath}/medals/${type}_${currentLevel + 1}_fond.png`"
      :alt="currentLevel + 1"
    >
  </span>
</template>
<script>
export default {
  name: "MedalProgress",

  props: {
    type: {
      type: String,
      default: 'Photographe'
    },
    currentLevel: {
      type: Number,
      required: true
    }
  },

  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style scoped lang="scss">
.medal {
  &.target {
    &.left {
      float: left;
    }

    &.right {
      float: right;
    }
  }
}
</style>