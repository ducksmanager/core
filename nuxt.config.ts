import { defineNuxtConfig } from "nuxt";
import eslintPlugin from "vite-plugin-eslint";

export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  css: [
    "@/assets/css/app.scss",
    "bootstrap/dist/css/bootstrap.css",
    "bootstrap-vue-3/dist/bootstrap-vue-3.css",
  ],
  intlify: {
    localeDir: "translations",
    vueI18n: "i18n.mjs",
  },
  build: {
    // Need to transpile otherwise SSR fails.
    transpile: [/bootstrap-vue-3/],
  },
  vite: {
    plugins: [eslintPlugin()],
  },
  experimental: {
    reactivityTransform: true,
  },
});
