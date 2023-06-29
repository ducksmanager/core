import { defineConfig } from "vite";
import path from "path";

import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "~types/": `${path.resolve(__dirname, "types")}/`,
      "~dm_types/": `${path.resolve(
        __dirname,
        "node_modules/ducksmanager/types"
      )}/`,
    },
  },
});
