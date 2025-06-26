import type { StorybookConfig } from "@storybook/vue3-vite";
import { join, dirname } from "path";
import AutoImport from "unplugin-auto-import/vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string): any =>
  dirname(require.resolve(join(value, "package.json")));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: [],
  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
  viteFinal: async (config) => {
    // Add auto-imports for Vue 3 Composition API
    config.plugins = config.plugins || [];
    config.plugins.push(
      AutoImport({
        eslintrc: {
          enabled: true,
        },
        imports: [
          "pinia",
          "vue",
          "vue/macros",
          "vue-router",
          "vue-i18n",
          "@vueuse/core",
        ],
        dts: true,
        dirs: [
          "./src/composables",
          "../web/src/composables",
          "../web/src/stores",
          "../../packages/types",
        ],
        vueTemplate: true,
      }),
    );

    return config;
  },
};
export default config;
