<template>
  <span :class="{ wrapper: true, small, 'x-small': xSmall }">
    <div class="overlay">
      <template v-if="!small && !xSmall">
        <div
          class="title"
          :title="medalDescription"
        />
        <svg
          v-if="level < 3"
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
      </template>
    </div>

    <img
      v-if="level <= 3"
      class="medal"
      :src="`${imagePath}/medals/${contribution}_${level}_${xSmall ? 'fond' : locale}.png`"
    >
    <b v-if="small">
      {{ medalTitle }}
      <br>{{ $t('niveau') }} {{ level }}
    </b>
  </span>
</template>
<script>
import medalMixin from "../mixins/medalMixin";

export default {
  name: 'Medal',
  mixins: [medalMixin],
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
    level() {
      return this.nextLevel && this.currentLevel !== null ? this.currentLevel + 1 : this.currentLevel
    },
    medalTitle() {
      switch(this.contribution.toUpperCase()) {
        case 'CREATEUR': return this.$t("Concepteur de tranches")
        case 'PHOTOGRAPHE': return this.$t("Photographe de tranches")
        case 'DUCKHUNTER': return this.$t("Duckhunter")
      }
      return ''
    },
    medalDescription() {
      let textTemplate
      if (this.currentLevel === 3) {
        switch (this.contribution.toUpperCase()) {
          case 'CREATEUR':
            textTemplate = "Vous avez {0} points Concepteur de tranches"
          break;
            case 'PHOTOGRAPHE':
            textTemplate = "Vous avez {0} points Photographe de tranches"
          break;
            case 'DUCKHUNTER':
            textTemplate = "Vous avez signalé {0} bouquineries"
        }
        return this.$t(textTemplate, [this.userLevelPoints])
      }
      else {
        switch (this.contribution.toUpperCase()) {
          case 'CREATEUR':
            textTemplate = "Vous avez {0} points Concepteur de tranches, obtenez-en {1} de plus pour recevoir le badge {2} !"
            break;
          case 'PHOTOGRAPHE':
            textTemplate = "Vous avez {0} points Photographe de tranches, envoyez-nous des photos de tranches depuis votre bibliothèque et obtenez {1} points de plus pour recevoir le badge {2} !"
            break;
          case 'DUCKHUNTER':
            textTemplate = "Vous avez signalé {0} bouquineries, signalez-en {1} de plus pour recevoir le badge {2}!"
        }
        return this.$t(textTemplate, [
          this.userLevelPoints,
          this.pointsDiffNextLevel,
          this.$t(this.medalColors[this.currentLevel])
        ])
      }
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
