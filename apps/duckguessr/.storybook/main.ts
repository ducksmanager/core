import type { StorybookConfig } from "@nuxtjs/storybook";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: [],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
};

export default config;
