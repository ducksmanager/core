<template>
  <div class="progress-wrapper">
    <Medal
      class="left"
      x-small
      :user-level-points="userLevelPoints"
      :contribution="contribution"
      target-level
    />
    <b-progress>
      <b-progress-bar
        class="progress-current"
        :style="{ width: `${medalProgressCurrentPercentage}%` }"
      />
      <b-progress-bar
        class="progress-extra"
        striped
        animated
        variant="success"
        :style="{ width: `${getLevelProgressPercentage(extraPoints)}%` }"
      />
      <div class="progress-extra-text">
        + {{ extraPoints }} {{ $t("Points") }}
      </div>
    </b-progress>
    <Medal
      class="right"
      x-small
      :user-level-points="userLevelPoints"
      :contribution="contribution"
      target-level
      next-level
    />
  </div>
</template>
<script setup>
import { BProgress, BProgressBar } from "bootstrap-vue-3";

import medal from "../composables/medal";
import Medal from "./Medal";

const props = defineProps({
  contribution: {
    type: String,
    default: "Photographe",
  },
  userLevelPoints: {
    type: Number,
    required: true,
  },
  extraPoints: {
    type: Number,
    required: true,
  },
});

const { medalProgressCurrentPercentage, getLevelProgressPercentage } = $(
  medal(props.contribution, props.userLevelPoints)
);
</script>

<style lang="scss">
.progress-wrapper {
  margin: 12px 0;

  .progress {
    position: relative;
    height: 1.5rem;
    font-size: 1rem;
    margin: 0 25px;

    .progress-current {
      background-color: lightgreen !important;
    }

    .progress-extra {
      color: rgb(40, 40, 40) !important;
      background-image: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      text-shadow: 1px 1px 2px lightgrey;
      white-space: nowrap;
      overflow-x: visible;
      animation-direction: reverse;
    }

    .progress-extra-text {
      position: absolute;
      left: 5px;
      top: 8px;
      display: inline-block;
      font-weight: bold;
      color: #222;
    }
  }
}
</style>
