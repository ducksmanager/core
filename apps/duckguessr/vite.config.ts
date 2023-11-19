 
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

export default defineConfig({
  clearScreen: false,
  resolve: { 
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "~duckguessr-api": path.resolve(__dirname, "api"),
      "~types": path.resolve(__dirname, "api/types"),
      "~dm-types": path.resolve(__dirname, "../../packages/types"),
      "~locales": path.resolve(__dirname, "locales"),
      "~prisma-clients": path.resolve(
        __dirname,
        "../../packages/prisma-clients",
      ),
      "~web": path.resolve(
        __dirname,
        "../web",
      ),
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
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({ 
      imports: ["vue", "vue/macros", "vue-router", "@vueuse/core", 'vue-i18n'],
      dts: true,
      dirs: ["./src/composables"],
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
  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
