/// <reference types="vitest" />

import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

export default defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "~types/": `${path.resolve(__dirname, "types")}/`,
      "~prisma_clients/*": `${path.resolve(__dirname, "api/dist/prisma")}/`,
    },
  },
  build: {
    rollupOptions: {
      external: ["~prisma_clients/client_dm"],
    },
  },
  plugins: [
    Vue({
      reactivityTransform: true,
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(__dirname, "..", "translations/**")],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue/macros", "vue-router", "@vueuse/core"],
      dts: true,
      dirs: ["./src/composables", "./types"],
      vueTemplate: true,
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [/*BootstrapVue3Resolver(), */ IconsResolve()],
      dirs: ["src/components", "src/components/menus", "src/layouts"],
      dts: true,
    }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: "jsdom",
  },
  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
function BootstrapVueNextResolver():
  | import("unplugin-vue-components/types").ComponentResolver
  | import("unplugin-vue-components/types").ComponentResolver[] {
  throw new Error("Function not implemented.");
}
