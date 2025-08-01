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
import mkcert from "vite-plugin-mkcert";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    mkcert(),
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
      ...eslintPlugin(),
      apply: "build",
    },
    {
      // do not fail on serve (i.e. local development)
      ...eslintPlugin({
        failOnWarning: false,
        failOnError: false,
      }),
      apply: "serve",
      enforce: "post",
    },
    AutoImport({
      dts: true,
      imports: ["vue", "vue-router", "vue-i18n", "pinia"],

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
      include: [path.resolve(__dirname, "..", "translations/**")],
    }),
  ],

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~dm-services": path.resolve(__dirname, "../../packages/api/services"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "~dumili-services": path.resolve(__dirname, "api/services"),
      "~dumili-types": path.resolve(__dirname, "types"),
      "~dumili-utils": path.resolve(__dirname, "utils"),
      "~group-by": path.resolve(__dirname, "../../util/group-by"),
      "~prisma": path.resolve(__dirname, "api/prisma"),
      "~web": path.resolve(__dirname, "../web"),
      "~translations": path.resolve(__dirname, "translations"),
    },
  },
});
