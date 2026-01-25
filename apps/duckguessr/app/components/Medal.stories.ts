import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import type { MedalLevelAndProgress } from "~duckguessr-types/playerStats";

import Medal from "./Medal.vue";

const meta = preview.meta({
  title: "Medal",
  component: Medal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["published-fr-recent", "it", "us", "fast", "ultra_fast"],
    },
    withGameData: {
      control: "boolean",
    },
  },
});

export const GoldPlus100Points = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 3,
      currentLevelPoints: 100,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "published-fr-recent",
  },
});

export const Gold = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 3,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "published-fr-recent",
  },
});

export const GoldItalian = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 3,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "it",
  },
});

export const GoldAmerican = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 3,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "us",
  },
});

export const SilverPlus10Points = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 2,
      currentLevelPoints: 10,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "published-fr-recent",
  },
});

export const SilverPlus90Points = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 2,
      currentLevelPoints: 90,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "published-fr-recent",
  },
});

export const SilverPlus90PointsProgress20Points = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 2,
      currentLevelPoints: 90,
      currentLevelProgressPoints: 20,
    } as MedalLevelAndProgress,
    type: "published-fr-recent",
    withGameData: true,
  },
});

export const Silver = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 2,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "fast",
  },
});

export const Bronze = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 1,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "ultra_fast",
  },
});

export const NoMedalPlus20Points = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 0,
      currentLevelPoints: 3,
      currentLevelProgressPoints: 5,
    } as MedalLevelAndProgress,
    type: "ultra_fast",
    withGameData: true,
  },
});

export const NoMedal = meta.story({
  args: {
    medalLevelAndProgress: {
      level: 0,
      currentLevelPoints: 0,
      currentLevelProgressPoints: 0,
    } as MedalLevelAndProgress,
    type: "ultra_fast",
  },
});
