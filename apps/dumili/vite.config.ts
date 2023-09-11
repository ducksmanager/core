import { promises as fs } from "node:fs";

import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import Pages from "vite-plugin-pages";

export default defineConfig({
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
    eslintPlugin(),
    AutoImport({
      dts: true,
      imports: ["vue", "vue-router"],
    }),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolver({})],
      dts: true,
    }),

    ReactivityTransform(),

    Pages(),

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
      "~pulumi-types/": `${path.resolve(__dirname, "types")}/`,
      "~types/": `${path.resolve(__dirname, "../../packages/types")}/`,
      "~api-routes/": `${path.resolve(
        __dirname,
        "../../packages/api-routes"
      )}/`,
      "web/": `${path.resolve(__dirname, "../web")}/`,
    },
  },
});
