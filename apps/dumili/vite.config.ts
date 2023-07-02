import { defineConfig } from "vite";
import path from "path";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";

import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: true,
      imports: ["vue", "vue-router"],
    }),
    Components({
      resolvers: [BootstrapVueNextResolver()],
      dts: true,
    }),

    ReactivityTransform(),

    Pages(),
    Layouts(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(__dirname, "..", "translations/**")],
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
