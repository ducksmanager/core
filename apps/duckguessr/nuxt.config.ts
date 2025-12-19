import { defineNuxtConfig } from "nuxt/config";
import path from "path";
import IconsResolver from "unplugin-icons/resolver";
import ViteComponents from "unplugin-vue-components/vite";
import checker from "vite-plugin-checker";

import getViteAliases from "../../vite-aliases";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    ...getViteAliases(path.resolve(__dirname, "../..")),
    "~/*": "/app/*",
    "~styles/*": "/styles/*",
    "~locales/*": "/locales/*",
    "~web": path.resolve(__dirname, "../web"),
    "~web/*": path.resolve(__dirname, "../web/*"),
    "~duckguessr-prisma-browser": "/api/prisma/client_duckguessr/browser",
    "~duckguessr-services": path.resolve(__dirname, "api/services"),
    "~duckguessr-services/*": path.resolve(__dirname, "api/services/*"),
    "~duckguessr-types": path.resolve(__dirname, "api/types"),
    "~duckguessr-types/*": path.resolve(__dirname, "api/types/*"),
  },

  devtools: { enabled: false },
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
    "unplugin-icons/nuxt",
    "@pinia/colada-nuxt",
  ],

  // Auto-imports
  imports: {
    dirs: [
      "~/stores",
      "../../packages/types",
      "~web/src/composables",
      "~web/src/stores",
    ],
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
    shim: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: false,
        noImplicitOverride: false,
      },
    },
  },

  // Runtime config
  runtimeConfig: {
    public: {
      dmSocketUrl: process.env.VITE_DM_SOCKET_URL || "",
      duckguessrSocketUrl: process.env.VITE_SOCKET_URL || "",
      sentryDsn: process.env.VITE_SENTRY_DSN || "",
    },
  },

  // Vite config
  vite: {
    plugins: [
      checker({ vueTsc: true }),
      ViteComponents({
        resolvers: [
          IconsResolver({
            prefix: "",
            strict: true,
          }),
        ],
        dts: true,
      }),
    ],
    resolve: {
      dedupe: ["vue", "vue-i18n", "@vueuse/core", "bootstrap-vue-next"],
    },
    server: {
      watch: {
        // Reduce file watching to prevent EMFILE errors
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/.nuxt/**",
          "**/.output/**",
          "**/storybook-static/**",
          "**/.turbo/**",
          "**/api/prisma/client_*/**",
          "**/.pnpm-store/**",
          "**/coverage/**",
          "**/.storybook/**",
          "**/.pnpm/**",
          "**/builds/**",
        ],
        // Use polling as fallback if native watching fails
        usePolling: false,
        // Reduce the number of files watched
        interval: 100,
        binaryInterval: 300,
      },
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
    server: false,
  },

  ignore: [
    "**/node_modules",
    "**/dist",
    ".git/**",
    "api/prisma/client_*",
    "**/.pnpm-store/**",
    "**/coverage/**",
    "**/.storybook/**",
    "**/.nuxt/**",
    "**/.output/**",
    "**/storybook-static/**",
    "**/.turbo/**",
  ],
});
