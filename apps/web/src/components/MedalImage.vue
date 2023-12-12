<template>
  <span class="wrapper" :class="{ small, 'x-small': xSmall }">
    <div class="overlay">
      <template v-if="!small && !xSmall">
        <div v-if="withDescription" class="title" :title="medalDescription" />
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
            :class="{ bar: true, [medalColors[level]]: true }"
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
      :src="
        getImagePath(
          `medals/${contribution}_${level}_${
            xSmall ? 'fond' : currentLocaleShortKey
          }.png`,
        )
      "
    />
    <b v-if="small">
      {{ medalTitle }}
      <br />{{ t("niveau") }} {{ level }}
    </b>
  </span>
</template>

<script setup lang="ts">
import { getCurrentLocaleShortKey } from "~/composables/useLocales";

const i18n = useI18n();
const currentLocaleShortKey = getCurrentLocaleShortKey(i18n.locale.value);

const props = defineProps<{
  small?: boolean;
  xSmall?: boolean;
  nextLevel?: boolean;
  userLevelPoints: number;
  contribution: string;
  currentLevel: number;
  pointsDiffNextLevel: number | null;
  levelProgressPercentage: number | null;
  radius: number;
  circumference: number;
  withDescription?: boolean;
  getImagePath: (name: string) => string;
}>();

const {
  contribution,
  nextLevel = false,
  userLevelPoints,
  small = false,
  xSmall = false,
  currentLevel,
  pointsDiffNextLevel,
  levelProgressPercentage,
  radius,
  circumference,
} = toRefs(props);
const { t } = useI18n();

const medalColors = ["bronze", "argent", "or"];
const level = computed(() =>
  nextLevel && currentLevel.value !== null
    ? currentLevel.value
    : currentLevel.value - 1,
);
const medalTitle = computed(() => {
  switch (contribution.value) {
    case "edge_photographer":
      return t("Concepteur de tranches");
    case "edge_designer":
      return t("Photographe de tranches");
    case "duckhunter":
      return t("Duckhunter");
  }
  return "";
});
const medalDescription = computed(() => {
  let textTemplate;
  if (currentLevel.value === 3) {
    switch (contribution.value) {
      case "edge_photographer":
        textTemplate = "Vous avez {0} points Concepteur de tranches";
        break;
      case "edge_designer":
        textTemplate = "Vous avez {0} points Photographe de tranches";
        break;
      case "duckhunter":
        textTemplate = "Vous avez signalé {0} bouquineries";
        break;
      default:
        return "";
    }
    return t(textTemplate, [userLevelPoints]);
  } else {
    switch (contribution.value) {
      case "edge_photographer":
        textTemplate =
          "Vous avez {0} points Photographe de tranches, envoyez-nous des photos de tranches depuis votre bibliothèque et obtenez {1} points de plus pour recevoir le badge {2} !";
        break;
      case "edge_designer":
        textTemplate =
          "Vous avez {0} points Concepteur de tranches, obtenez-en {1} de plus pour recevoir le badge {2} !";
        break;
      case "duckhunter":
        textTemplate =
          "Vous avez signalé {0} bouquineries, signalez-en {1} de plus pour recevoir le badge {2}!";
        break;
      default:
        return "";
    }
    return t(textTemplate, [
      userLevelPoints.value,
      pointsDiffNextLevel.value,
      t(medalColors[currentLevel.value]),
    ]);
  }
});
</script>

<style scoped lang="scss">
.wrapper {
  &.left,
  &.right {
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
          stroke: #b87333;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    float: left;
    text-align: center;
    margin: 5px;

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
