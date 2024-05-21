<template>
  <ion-col size="4">
    <MedalImage
      :small="small"
      :x-small="xSmall"
      :with-description="false"
      :next-level="nextLevel"
      :user-level-points="userLevelPoints"
      :contribution="contribution"
      :current-level="currentLevel"
      :points-diff-next-level="pointsDiffNextLevel"
      :level-progress-percentage="levelProgressPercentage"
      :radius="radius"
      :circumference="circumference"
      :get-image-path="getImagePath"
  /></ion-col>
</template>

<script setup lang="ts">
import { components as webComponents } from '~web';

import useMedal from '~/composables/useMedal';
import { images } from '~/stores/images';

const { MedalImage } = webComponents;

const {
  contribution,
  nextLevel = false,
  userLevelPoints,
  small = false,
  xSmall = false,
} = defineProps<{
  small?: boolean;
  xSmall?: boolean;
  nextLevel?: boolean;
  userLevelPoints: number;
  contribution: string;
}>();

const { currentLevel, pointsDiffNextLevel, levelProgressPercentage, radius, circumference } = useMedal(
  contribution,
  userLevelPoints,
);

const getImagePath = images().getImagePath;
</script>
<style lang="scss" scoped>
.wrapper {
  width: 100%;
}
</style>
