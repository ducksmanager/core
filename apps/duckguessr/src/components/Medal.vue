<template>
  <div
    class="wrapper d-flex flex-column text-center p-0"
    :class="{ simple: !withDetails }"
  >
    <div
      class="position-relative medal"
      :style="{ backgroundImage: nextMedalUrl }"
      :title="withTitle ? medalTitle : ''"
    >
      <div
        class="position-absolute overlay"
        :class="{ desaturated: medalLevelAndProgress.level === 0 }"
        :title="withTitle ? medalTitle : ''"
        :style="{
          backgroundImage: currentMedalUrl,
          'clip-path': `inset(0px 0px 0px ${
            shownLevelPercentage + currentLevelPercentageProgress
          }%)`,
        }"
      />
    </div>
    <div v-if="withDetails">
      <h6>
        {{ medalTypes[type].title }}
        <i-bi-info-circle-fill variant="info" :title="medalTitle" />
      </h6>

      <div class="small">{{ medalTypes[type].description }}</div>
    </div>
    <div v-if="withGameData" class="small text-white">
      &times;
      {{ medalLevelAndProgress.currentLevelProgressPoints }}&nbsp;
    </div>
  </div>
</template>

<script setup lang="ts">
import { MEDAL_LEVELS } from "~/stores/user";
import type { MedalLevelAndProgress } from "~duckguessr-types/playerStats";

const { t } = useI18n();
const medalTypes = computed(
  (): Record<string, { title: string; description: string }> => ({
    Francais: {
      title: t("French Expert"),
      description: t("You won a game guessing French authors"),
    },
    it: {
      title: t("Italian Expert"),
      description: t("You won a game guessing Italian authors"),
    },
    "published-fr-recent": {
      title: t("French Publications Expert"),
      description: t(
        "You won a game guessing authors from French publications",
      ),
    },
    fast: {
      title: t("Fast"),
      description: t("You guessed a drawing in less than 5 seconds"),
    },
    ultra_fast: {
      title: t("Super Fast"),
      description: t("You guessed a drawing in less than 2 seconds"),
    },
    us: {
      title: t("US Expert"),
      description: t("You won a game guessing American authors"),
    },
  }),
);

const {
  medalLevelAndProgress,
  type,
  withGameData = false,
  withTitle = true,
  withDetails = false,
} = defineProps<{
  type: string;
  withGameData?: boolean;
  withDetails?: boolean;
  withTitle?: boolean;
  medalLevelAndProgress: MedalLevelAndProgress;
}>();

const levels = computed(
  () => MEDAL_LEVELS.find(({ medalType }) => medalType === type)!.levels,
);

const currentLevelThreshold = computed(() =>
  medalLevelAndProgress.level === 0
    ? 0
    : levels.value[medalLevelAndProgress.level - 1],
);
const nextLevelThreshold = computed(
  () => levels.value[medalLevelAndProgress.level],
);

const totalPointsToReachNextLevel = computed(
  () => nextLevelThreshold.value - currentLevelThreshold.value,
);

const levelPercentage = computed(
  () =>
    (100 * medalLevelAndProgress.currentLevelPoints) /
    totalPointsToReachNextLevel.value,
);

const shownLevelPercentage = computed(() => (levelPercentage.value + 15) / 1.5);

const levelPercentageProgress = computed(
  () =>
    (100 * medalLevelAndProgress.currentLevelProgressPoints) /
    totalPointsToReachNextLevel.value,
);

const medalTitle = computed(() => {
  let title = medalTypes.value[type].title;
  const { level, currentLevelProgressPoints, currentLevelPoints } =
    medalLevelAndProgress;
  if (level > 0) {
    title += ` - ${t(medalColors[level - 1])}`;
  }
  title += "\n";
  if (withGameData) {
    title +=
      t(`+ {newPoints} point(s)`, {
        newPoints: currentLevelProgressPoints,
      }) + "\n";
  }
  if (level < 3) {
    const nextLevel = level;
    const pointsToNextThreshold =
      totalPointsToReachNextLevel.value -
      (currentLevelPoints + currentLevelProgressPoints);
    if (isNaN(pointsToNextThreshold)) {
      console.error(
        JSON.stringify({
          totalPointsToReachNextLevel: totalPointsToReachNextLevel.value,
          currentLevelPoints,
          currentLevelProgressPoints,
        }),
      );
    }
    title += t(
      `Earn {pointsToNextThreshold} more points to get the {nextMedal} medal`,
      {
        pointsToNextThreshold,
        nextMedal: t(medalColors[nextLevel]),
      },
    );
  }
  return title;
});

const currentLevelPercentageProgress = ref(0);
const isCurrentLevelPercentageProgressGoingUp = ref(true);

const medalColors = ["Bronze", "Silver", "Gold"];

const getMedalUrl = (level: number) =>
  `url('/medals/256px/${type} ${medalColors[
    Math.max(0, level - 1)
  ].toUpperCase()}.png')`;

const currentMedalUrl = computed(() =>
  getMedalUrl(Math.max(0, medalLevelAndProgress.level)),
);
const nextMedalUrl = computed(() =>
  getMedalUrl(Math.min(3, medalLevelAndProgress.level + 1)),
);

onMounted(() => {
  console.log(
    `Type: ${type}, Current level and progress: ${JSON.stringify(
      medalLevelAndProgress,
    )}`,
  );
  setInterval(() => {
    if (!withGameData) {
      currentLevelPercentageProgress.value = levelPercentageProgress.value;
    } else if (levelPercentageProgress.value) {
      const increment = levelPercentageProgress.value / 20;
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= levelPercentageProgress.value
      ) {
        isCurrentLevelPercentageProgressGoingUp.value =
          !isCurrentLevelPercentageProgressGoingUp.value;
      }
      currentLevelPercentageProgress.value +=
        increment * (isCurrentLevelPercentageProgressGoingUp.value ? 1 : -1);
    }
  }, 50);
});
</script>

<style scoped lang="scss">
.wrapper {
  width: 192px;

  &.simple {
    width: initial;

    .medal {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 100%;

      .overlay {
        height: 100%;
      }
    }
  }

  .medal {
    width: 100%;
    height: 192px;
    background-size: contain;
    background-repeat: no-repeat;

    .overlay {
      width: 100%;
      height: 192px;
      background-position-x: right;
      background-size: contain;
      background-repeat: no-repeat;
      right: 0;

      &.desaturated {
        filter: saturate(0%);
      }
    }
  }
}
</style>
