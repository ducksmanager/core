import { json } from 'body-parser'
import ESLintPlugin from 'eslint-webpack-plugin'

export default {
  telemetry: false,

  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/vue-gates',
    '~/plugins/axios',
    { src: '~/plugins/vue-cropper', ssr: false },
    { src: '~/plugins/vue-bootstrap-typeahead', ssr: false },
    { src: '~/plugins/backend-data', ssr: false },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/dotenv',

    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',

    '@nuxt/typescript-build',

    // Nuxt 2 only:
    // https://composition-api.nuxtjs.org/getting-started/setup#quick-start
    '@nuxtjs/composition-api/module',
    '@pinia/nuxt',

    // https://github.com/nuxt-community/localforage-module
    '@nuxtjs/localforage',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/Developmint/nuxt-svg-loader#readme
    'nuxt-svg-loader',
    // Doc: https://nuxt-community.github.io/nuxt-i18n/
    [
      '@nuxtjs/i18n',
      {
        lazy: true,
        langDir: 'locales/',
        defaultLocale: 'fr',
        fallbackLocale: 'en',
        formatFallbackMessages: true,
        locales: [
          {
            code: 'fr',
            name: 'Français',
            iso: 'fr-FR',
            file: 'fr-FR.json',
          },
          {
            code: 'en',
            name: 'English',
            iso: 'en-US',
            file: 'en-US.js',
          },
        ],
      },
    ],
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    // Doc: https://github.com/microcipcip/cookie-universal
    'cookie-universal-nuxt',
    // Doc: https://github.com/nuxt-community/sentry-module#readme
    '@nuxtjs/sentry',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    proxy: true,
    credentials: true,
    proxyHeaders: true,
  },

  sentry: {
    dsn: 'https://1ef2d57a3c4d4414abbd5fb61771cd3f@o229092.ingest.sentry.io/5595460',
    config: {},
  },

  /*
   ** Build configuration
   */
  build: {
    transpile: ['@nuxtjs/auth'],
    /*
     ** You can extend webpack config here
     */
    extend(config, { isClient, isDev }) {
      if (isDev && isClient) {
        config.plugins.push(new ESLintPlugin())
      }
    },
  },

  serverMiddleware: [
    json({ limit: '10mb' }),
    {
      path: '/api',
      handler: '~/api/api.js',
    },
    {
      path: '/user-id',
      handler: '~/api/user-id.js',
    },
    {
      path: '/wanted-edges',
      handler: '~/api/wanted-edges.js',
    },
    {
      path: '/fs/base64',
      handler: '~/api/fs/base64.js',
    },
    {
      path: '/fs/browse',
      handler: '~/api/fs/browse.js',
    },
    {
      path: '/fs/browseEdges',
      handler: '~/api/fs/browseEdges.js',
    },
    {
      path: '/fs/save',
      handler: '~/api/fs/saveEdge.js',
    },
    {
      path: '/fs/text',
      handler: '~/api/fs/text.js',
    },
    {
      path: '/fs/upload',
      handler: '~/api/fs/upload.js',
    },
    {
      path: '/fs/upload-base64',
      handler: '~/api/fs/upload-base64.js',
    },
    {
      path: '/generate',
      handler: '~/api/fs/generateDefaultEdge.js',
    },
    {
      path: '/edges',
      handler: '~/api/edge-proxy.js',
    },
  ],
}
