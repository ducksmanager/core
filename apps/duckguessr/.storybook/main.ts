import type { StorybookConfig } from "@storybook/vue3-vite";
import path from "path";
import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {},
  },
  viteFinal: async (config) => {
    // Add the same aliases as in the main vite.config.ts
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "~": path.resolve(__dirname, "../src"),
      "~locales": path.resolve(__dirname, "../locales"),
      "~dm-services": path.resolve(__dirname, "../../../packages/api/services"),
      "~dm-types": path.resolve(__dirname, "../../../packages/types"),
      "~duckguessr-prisma-client": path.resolve(
        __dirname,
        "../api/prisma/client_duckguessr",
      ),
      "~duckguessr-types": path.resolve(__dirname, "../api/types"),
    };
    
    // Add extensions to help with resolution
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".vue",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
    ];
    
    return config;
  },
};
export default config;
