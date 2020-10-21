<template>
  <span :class="{ wrapper: true, small }">
    <div class="overlay">
      <div
        class="title"
        :title="$t(`DETAILS_MEDAILLE_${level.contribution.toUpperCase()}_MAX`, [
          level.userPoints,
          level.pointsDiffNextLevel,
          $t(`MEDAILLE_${level.levelReached+1}`)
        ])"
      />
      <svg
        v-if="!small && level.levelReached < 3"
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
          :class="{bar: true, [medalColors[level.levelReached]]: true}"
          cx="-50"
          cy="50"
          :r="radius"
          fill="transparent"
          :stroke-dasharray="circumference"
          :style="`stroke-dashoffset: ${level.levelProgressPercentage}px`"
        />
      </svg>
    </div>

    <img
      class="medal"
      :src="`${imagePath}/medals/${level.contribution}_${level.levelReached}_${locale}.png`"
    >
    <b v-if="small">
      {{ l10n[`TITRE_MEDAILLE_${level.contribution.toUpperCase()}`] }}
      <br>{{ l10n.NIVEAU }}{{ level.levelReached }}
    </b>
  </span>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import medalsMixin from "../mixins/medalsMixin";

export default {
  name: 'Medal',
  mixins: [l10nMixin, medalsMixin],
  props: {
    level: {
      type: Object,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    medalColors: ['bronze', 'argent', 'or'],
  }),

  computed: {
    locale: () => window.locale,
    imagePath: () => window.imagePath
  }
}
</script>
<style scoped lang="scss">
.wrapper {
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
}
</style>