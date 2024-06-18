import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolve from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";

const RenderComponentResolver = (name: string) => {
  const file = path.resolve(__dirname, `src/components/renders/${name}.vue`);

  if (fs.existsSync(file)) {
    return file;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "~api-routes": path.resolve(__dirname, "../../packages/api-routes"),
      "~axios-helper": path.resolve(__dirname, "../../packages/axios-helper"),
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
      "~prisma-clients": path.resolve(
        __dirname,
        "../../packages/prisma-clients",
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

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      include: [path.resolve(__dirname, "..", "locales/**")],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue/macros", "vue-router", "@vueuse/core"],
      dts: true,
      dirs: ["./src/composables", "./types"],
      vueTemplate: true,
      resolvers: [RenderComponentResolver],
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
      dirs: [
        "src/components",
        "src/layouts",
        "node_modules/ducksmanager/dist/src/components",
      ],
      dts: true,
      deep: true,
    }),
  ],

  server: {
    watch: {
      ignored: ["**/api/**", "**/.idea/**"],
    },
  },
});
