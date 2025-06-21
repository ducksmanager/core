import path from "path";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~locales": path.resolve(__dirname, "locales"),
      "~dm-services": path.resolve(__dirname, "../../packages/api/services"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "~duckguessr-prisma-client": path.resolve(
        __dirname,
        "api/prisma/client_duckguessr",
      ),
      "~duckguessr-types": path.resolve(__dirname, "api/types"),
      "~socket.io-client-services": path.resolve(
        __dirname,
        "../../packages/socket.io-client-services",
      ),
      "~socket.io-services": path.resolve(
        __dirname,
        "../../packages/socket.io-services",
      ),
    },
  },
  plugins: [
    Vue(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
    }),

    // https://github.com/antfu/unplugin-auto-import
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
        "./src/composables",
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
