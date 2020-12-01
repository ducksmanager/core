<template>
  <div :class="{...classes, small}">
    <a :href="username ? $r('/collection/show') : '/'">
      <img
        :src="`${imagePath}/logo_small.png`"
        alt="DucksManager"
      >
    </a>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Banner",
  mixins: [l10nMixin],

  props: {
    classes: {
      type: Object,
      default: () => ({})
    },
    small: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    imagePath: () => window.imagePath,
    username: () => window.username
  }
}
</script>

<style scoped lang="scss">
div {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 180px;

  &.small {
    img {
      height: 50px;
      top: 0;
      position: fixed;
      right: 10px;
    }
  }

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}
</style>