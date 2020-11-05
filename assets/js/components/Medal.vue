<template>
  <span :class="{ wrapper: true, small, 'x-small': xSmall }">
    <div class="overlay">
      <div
        v-if="!small && !xSmall"
        class="title"
        :title="currentLevel === 3
          ? $t(`DETAILS_MEDAILLE_${contribution.toUpperCase()}_MAX`, [userLevelPoints])
          : $t(`DETAILS_MEDAILLE_${contribution.toUpperCase()}`, [
            userLevelPoints,
            pointsDiffNextLevel,
            $t(`MEDAILLE_${level+1}`)
          ])"
      />
      <svg
        v-if="!small && !xSmall && level < 3"
        width="100"
        height="100"
        viewport="0 0 0 0"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          :r="radius"
          cx="50"
          cy="50"
          fill="transparent"
          :stroke-dasharray="circumference"
          stroke-dashoffset="0"
        />
        <circle
          transform="rotate(270,0,0)"
          :class="{bar: true, [medalColors[level]]: true}"
          cx="-50"
          cy="50"
          :r="radius"
          fill="transparent"
          :stroke-dasharray="circumference"
          :style="`stroke-dashoffset: ${levelProgressPercentage}px`"
        />
      </svg>
    </div>

    <img
      class="medal"
      :src="`${imagePath}/medals/${contribution}_${level}_${xSmall ? 'fond' : locale}.png`"
    >
    <b v-if="small">
      {{ l10n[`TITRE_MEDAILLE_${contribution.toUpperCase()}`] }}
      <br>{{ l10n.NIVEAU }} {{ level }}
    </b>
  </span>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import medalMixin from "../mixins/medalMixin";

export default {
  name: 'Medal',
  mixins: [l10nMixin, medalMixin],
  props: {
    small: {type: Boolean, default: false},
    xSmall: {type: Boolean, default: false},
    nextLevel: {type: Boolean, default: false},
    userLevelPoints: {type: Number, required: true},
    contribution: {type: String, required: true},
  },

  data: () => ({
    medalColors: ['bronze', 'argent', 'or'],
  }),

  computed: {
    locale: () => window.locale,
    imagePath: () => window.imagePath,

    level() {
      return this.nextLevel && this.currentLevel !== null ? this.currentLevel + 1 : this.currentLevel
    }
  }
}
</script>
<style scoped lang="scss">
.wrapper {
  &.left, &.right {
    position: absolute;
    top: 35px;
  }
  &.left {
    left: 35px;
  }

  &.right {
    right: 35px;

  }
  .medal {
    height: 120px;
    margin-left: 5px;
  }

  .overlay {
    position: absolute;
    display: inline-block;
    margin-left: 1px;
    margin-top: 2px;

    .title {
      position: absolute;
      width: 100px;
      height: 120px;
    }

    svg circle {
      stroke-dashoffset: 0;
      stroke: #2e353d;
      stroke-width: 5px;

      &.bar {
        &.bronze {
          stroke: #B87333;
        }

        &.argent {
          stroke: silver;
        }

        &.or {
          stroke: #e6ac00;
        }
      }
    }
  }

  &.small {
    float: left;
    text-align: center;
    margin: 5px;
    width: 160px;

    .medal {
      height: 70px;
    }
  }

  &.x-small {
    .medal {
      height: 40px;
    }
  }
}
</style>