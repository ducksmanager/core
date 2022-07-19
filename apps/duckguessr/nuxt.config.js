import { json } from 'body-parser'

export default {
  telemetry: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Duckguessr',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://composition-api.nuxtjs.org
    '@nuxtjs/composition-api/module',
    '@pinia/nuxt',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/dotenv',
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // Doc: https://nuxt-community.github.io/nuxt-i18n/
    [
      '@nuxtjs/i18n',
      {
        langDir: 'locales/',
        defaultLocale: 'fr',
        fallbackLocale: 'en',
        formatFallbackMessages: true,
        locales: [
          {
            code: 'fr',
            name: 'Français',
            iso: 'fr',
            file: 'fr-FR.json',
          },
          {
            code: 'en',
            name: 'English',
            iso: 'en-US',
            file: 'en-US.js',
          },
          {
            code: 'es',
            name: 'Español',
            iso: 'es',
            file: 'es.json',
          },
          {
            code: 'de',
            name: 'Deutsch',
            iso: 'de',
            file: 'de.json',
          },
        ],
      },
    ],
    // Doc: https://github.com/nuxt-community/sentry-module#readme
    '@nuxtjs/sentry',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: true,
    credentials: true,
    proxyHeaders: true,
  },

  sentry: {
    dsn: 'https://4cefe8e809654e9099663f8891e701d2@o229092.ingest.sentry.io/6443646',
    config: {},
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  watchers: {
    webpack: {
      ignored: '/node_modules/',
    },
  },

  serverMiddleware: [
    json({ limit: '10mb' }),
    {
      path: '/api/dataset',
      handler: '~/api/dataset.js',
    },
    {
      path: '/api/game',
      handler: '~/api/game.js',
    },
    {
      path: '/api/round',
      handler: '~/api/round.js',
    },
    {
      path: '/api/podium',
      handler: '~/api/podium.js',
    },
    {
      path: '/api/admin/maintenance',
      handler: '~/api/admin/maintenance.js',
    },
  ],
}
