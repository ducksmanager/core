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
import Layouts from "vite-plugin-vue-layouts";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ["pinia", "vue", "vue-i18n", "vue-router", "@vueuse/core"],
    alias: {
      "~": `${path.resolve(__dirname, "src")}/`,
      "~web": path.resolve(__dirname, "../web"),
      "~dm-services": path.resolve(__dirname, "../../packages/api/services"),
      "~edgecreator-services": path.resolve(__dirname, "api/services"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "socket-call-server": path.resolve(
        __dirname,
        "../../packages/socket.io-services",
      ),
      "socket-call-client": path.resolve(
        __dirname,
        "../../packages/socket.io-client-services",
      ),
      "~prisma-schemas": path.resolve(
        __dirname,
        "../../packages/prisma-schemas",
      ),
      "~types/": `${path.resolve(__dirname, "types")}/`,
    },
  },

  plugins: [
    Vue(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(__dirname, "..", "locales/**")],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "pinia", "vue-i18n"],
      dts: true,
      dirs: [
        "../../packages/types",
        "../web/src/stores",
        "./src/components",
        "./src/composables",
        "./types",
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
      dirs: ["src/components", "src/layouts"],
      dts: true,
      deep: true,
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
