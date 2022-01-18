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
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "Banner",

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
  methods: {
    ...mapActions(l10n, ["$r"]),
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
