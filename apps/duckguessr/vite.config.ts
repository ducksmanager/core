import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  clearScreen: false,
  resolve: {
    dedupe: [
      "pinia",
      "vue",
      "vue-i18n",
      "vue-router",
      "@vueuse/core",
      "bootstrap-vue-next",
    ],
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~locales": path.resolve(__dirname, "locales"),
      "~dm-services": path.resolve(__dirname, "../../packages/api/services"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "~duckguessr-services": path.resolve(__dirname, "api/services"),
      "~duckguessr-prisma-client": path.resolve(
        __dirname,
        "api/prisma/client_duckguessr",
      ),
      "~duckguessr-types": path.resolve(__dirname, "api/types"),
      "~web": path.resolve(__dirname, "../web"),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: ".env.prod",
          dest: ".env",
        },
      ],
    }),

    Vue(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
    }),

    AutoImport({
      eslintrc: {
        enabled: true,
      },
      imports: [
        "pinia",
        "vue",
        "vue/macros",
        "vue-router",
        "vue-i18n",
        "@vueuse/core",
      ],
      dts: true,
      dirs: [
        "../web/src/composables",
        "../web/src/stores",
        "../../packages/types",
      ],
      vueTemplate: true,
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dirs: ["src/components", "src/pages"],
      dts: true,
    }),
  ],
  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
