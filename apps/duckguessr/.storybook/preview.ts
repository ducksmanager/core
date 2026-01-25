import { definePreview } from "@storybook-vue/nuxt";

export default definePreview({
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  addons: []
});
