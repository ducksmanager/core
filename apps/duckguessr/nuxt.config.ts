import getViteAliases from "../../vite-aliases";
import path from "path";
import { defineNuxtConfig } from "nuxt/config";
import checker from "vite-plugin-checker";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    ...getViteAliases(path.resolve(__dirname, "../..")),
    "~/*": "/app/*",
    "~styles/*": "/styles/*",
    "~locales/*": "/locales/*",
    "~web": path.resolve(__dirname, "../web"),
    "~web/*": path.resolve(__dirname, "../web/*"),
    "~duckguessr-prisma-client": "/api/prisma/client_duckguessr/client",
    "~duckguessr-services/*": "/api/services/*",
    "~duckguessr-types/*": "/api/types/*",
  },

  devtools: { enabled: true },
  compatibilityDate: "2025-09-09",

  // CSS
  css: ["bootstrap/dist/css/bootstrap.min.css", "./styles/main.scss"],

  // Modules
  modules: [
    "@bootstrap-vue-next/nuxt",
    [
      "@nuxtjs/i18n",
      {
        locales: [
          { code: "fr", file: "fr-FR.json" },
          { code: "en", file: "en-US.json" },
          { code: "de", file: "de.json" },
          { code: "es", file: "es.json" },
        ],
        langDir: "../locales",
        defaultLocale: "fr",
        strategy: "prefix_except_default",
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: "locale",
          redirectOn: "root",
        },
      },
    ],
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/storybook",
    [
      "@sentry/nuxt/module",
      {
        sourceMapsUploadOptions: {
          org: "bruno-perel",
          project: "duckguessr",
        },
      },
    ],
    "@nuxt/eslint",
  ],

  // Auto-imports
  imports: {
    dirs: ["~/stores", "../../packages/types"],
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
    shim: true,
  },

  // Runtime config
  runtimeConfig: {
    public: {
      dmSocketUrl: process.env.VITE_DM_SOCKET_URL || "",
      sentryDsn: process.env.VITE_SENTRY_DSN || "",
    },
  },

  // Vite config
  vite: {
    plugins: [checker({ vueTsc: true })],
    resolve: {
      dedupe: [
        "vue",
        "vue-router",
        "vue-i18n",
        "@vueuse/core",
        "bootstrap-vue-next",
      ],
    },
  },

  // App configuration
  app: {
    head: {
      title: "DuckGuessr",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  sourcemap: {
    client: "hidden",
  },
});
