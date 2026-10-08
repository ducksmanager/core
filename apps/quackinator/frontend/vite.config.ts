import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
      dts: "components.d.ts",
    }),
  ],
  resolve: {
    alias: { "~quackinator": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
  },
});
