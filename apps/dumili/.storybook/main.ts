import { defineMain } from "@storybook/vue3-vite/node";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import getViteAliases from "../../../vite-aliases";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default defineMain({
  stories: ["../src/**/*.stories.ts"],
  addons: [
    // Load core addons first to ensure proper state initialization
    getAbsolutePath("@storybook/addon-docs"),
    // Load Chromatic addon last to avoid state synchronization issues
    getAbsolutePath("@chromatic-com/storybook"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {},
  },
  core: {
    // Disable telemetry to avoid state synchronization issues
    disableTelemetry: true,
  },
  async viteFinal(config) {
    // Merge custom Vite config with Storybook's config
    const baseDir = path.resolve(__dirname, "../../..");
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...getViteAliases(baseDir, {
        "~": path.resolve(__dirname, "../src"),
        "~dumili-services": path.resolve(__dirname, "../api/services"),
        "~dumili-types": path.resolve(__dirname, "../types"),
        "~dumili-utils": path.resolve(__dirname, "../utils"),
        "~prisma": path.resolve(__dirname, "../api/prisma"),
        "~translations": path.resolve(__dirname, "../translations"),
        "~web": path.resolve(__dirname, "../../web"),
      }),
      // Replace socket-call-client with mock for Storybook
      "socket-call-client": path.resolve(__dirname, "mocks/socket.ts"),
    };
    config.resolve.dedupe = [
      ...(config.resolve.dedupe || []),
      "pinia",
      "vue",
      "vue-i18n",
      "vue-router",
      "@vueuse/core",
      "bootstrap-vue-next",
    ];
    // Ensure CSS/SCSS is processed correctly
    // Vite should handle SCSS automatically if sass is installed, but let's ensure it's configured
    config.css = config.css || {};
    // Ensure SCSS preprocessor is available
    if (!config.css.preprocessorOptions) {
      config.css.preprocessorOptions = {};
    }
    // Configure environment variables to fix React production mode warning
    // Set NODE_ENV to 'development' for dev server to prevent React dead code elimination check
    config.define = {
      ...config.define,
      "process.env.NODE_ENV": JSON.stringify("development"),
    };
    return config;
  },
});
