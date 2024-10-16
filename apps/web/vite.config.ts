/// <reference types="vitest" />

import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import * as path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "~dm-services": path.resolve(__dirname, "../../packages/api/services"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "~socket.io-services": path.resolve(
        __dirname,
        "../../packages/socket.io-services",
      ),
      "~socket.io-client-services": path.resolve(
        __dirname,
        "../../packages/socket.io-client-services",
      ),
      "~prisma-schemas": path.resolve(
        __dirname,
        "../../packages/prisma-schemas",
      ),
      "~translations": path.resolve(__dirname, "translations"),
    },
  },
  plugins: [
    ReactivityTransform(),
    Vue(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(__dirname, "translations/**")],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue/macros",
        "vue-router",
        "@vueuse/core",
        "pinia",
        "vue-i18n",
      ],
      dts: true,
      dirs: ["./src/composables", "./src/stores", "../../packages/types"],
      vueTemplate: true,
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dirs: ["src/components", "src/components/menus", "src/layouts"],
      dts: true,
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },

  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
