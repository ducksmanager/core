import { promises as fs } from "node:fs";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import getViteAliases from "../../vite-aliases.ts";

export default defineConfig({
  build: {
    sourcemap: true,
    cssMinify: "esbuild",
  },
  plugins: [
    vue(),
    Icons({
      autoInstall: true,
      customCollections: {
        // key as the collection name
        "extra-icons": {
          brokenLightbulb: () =>
            fs.readFile("./public/broken-lightbulb.svg", "utf-8"),
        },
      },
    }),
    {
      // default settings on build (i.e. fail on error)
      ...eslintPlugin({
        overrideConfigFile: path.resolve(
          import.meta.dirname,
          "eslint.config.mjs",
        ),
      }),
      apply: "build",
    },
    {
      // do not fail on serve (i.e. local development)
      ...eslintPlugin({
        failOnWarning: false,
        failOnError: false,
        overrideConfigFile: path.resolve(
          import.meta.dirname,
          "eslint.config.mjs",
        ),
      }),
      apply: "serve",
      enforce: "post",
    },
    AutoImport({
      dts: "src/auto-imports.d.ts",
      imports: ["vue", "vue-router", "vue-i18n", "pinia", "@vueuse/core"],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
      dirs: [
        "../web/src/composables",
        "../web/src/stores",
        "../../packages/types",
      ],
    }),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolver({})],
      dts: true,
    }),
    Pages(),
    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),
    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(import.meta.dirname, "..", "translations/**")],
    }),
  ],
  resolve: {
    dedupe: [
      "pinia",
      "vue",
      "vue-i18n",
      "vue-router",
      "@vueuse/core",
      "bootstrap-vue-next",
    ],
    alias: getViteAliases(path.resolve(import.meta.dirname, "../.."), {
      "~": path.resolve(import.meta.dirname, "src"),
      "~dumili-services": path.resolve(import.meta.dirname, "api/services"),
      "~dumili-types": path.resolve(import.meta.dirname, "types"),
      "~dumili-utils": path.resolve(import.meta.dirname, "utils"),
      "~prisma": path.resolve(import.meta.dirname, "api/prisma"),
      "~translations": path.resolve(import.meta.dirname, "translations"),
      "~web": path.resolve(import.meta.dirname, "../web"),
      "~quackinator": path.resolve(
        import.meta.dirname,
        "../quackinator/frontend/src",
      ),
    }),
  },
  server: {
    forwardConsole: true,
  },
});
