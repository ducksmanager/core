import { defineMain } from "@storybook-vue/nuxt/node";
import type { StorybookConfig } from "@nuxtjs/storybook";

export default defineMain({
  stories: ["../app/**/*.stories.ts"],
  addons: [],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
});
