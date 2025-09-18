import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import { readFile } from "fs/promises";
import * as path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";

import getViteAliases from "../../vite-aliases";

export default defineConfig({
  clearScreen: false,
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: getViteAliases(path.resolve(__dirname, "../.."), {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "~web-translations": path.resolve(__dirname, "translations"),
    }),
  },
  plugins: [
    ReactivityTransform(),
    VueRouter(),
    Vue(),

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
        VueRouterAutoImports,
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
      customCollections: {
        "extra-icons": {
          coafoot: () =>
            readFile("./public/images/icons/coafoot.svg").then((buffer) =>
              buffer.toString(),
            ),
        },
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dirs: ["src/components", "src/components/menus", "src/layouts"],
      dts: true,
    }),
  ],

  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
