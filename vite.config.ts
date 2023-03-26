/// <reference types="vitest" />

import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import path from "path";
import typescript2 from "rollup-plugin-typescript2";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
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
    cssCodeSplit: true,
    lib: {
      entry: `${path.resolve(__dirname, "src/components/index.ts")}`,
      name: "ducksmanager",
      fileName: () => `ducksmanager.js`,
    },
    rollupOptions: {
      external: ["~prisma_clients/client_dm", "vue", "public"],
      input: {
        main: path.resolve(__dirname, "src/components/index.ts"),
      },
      output: {
        assetFileNames: (assetInfo): string => {
          if (assetInfo.name === "main.css") return "ducksmanager.css";
          return assetInfo.name || "";
        },
        exports: "named",
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  plugins: [
    Vue({
      reactivityTransform: true,
    }),
    dts({
      insertTypesEntry: true,
    }),
    typescript2({
      check: false,
      include: ["src/components/**/*.vue"],
      tsconfigOverride: {
        compilerOptions: {
          outDir: "dist",
          sourceMap: true,
          declaration: true,
          declarationMap: true,
        },
      },
      exclude: ["vite.config.ts"],
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
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
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
