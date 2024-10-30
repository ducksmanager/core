/// <reference types="histoire" />
import vue from '@vitejs/plugin-vue';
import ReactivityTransform from '@vue-macros/reactivity-transform/vite';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { IonicResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8008,
  },

  build: {
    sourcemap: true,
  },

  plugins: [
    vue(),
    ReactivityTransform(),
    viteStaticCopy({
      targets: [
        {
          src: '../web/public/images/medals/*.png',
          dest: 'images/medals',
        },
      ],
    }),
    Components({
      resolvers: [IonicResolver()],
      dts: true,
      globs: [
        'src/components/**/*.vue',
        '../web/src/components/Bookcase.vue',
        '../web/src/components/Edge.vue',
        '../web/src/components/EdgeContents.vue',
      ],
      allowOverrides: true,
    }),

    AutoImport({
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
      dirs: ['../web/src/composables', '../web/src/stores', '../../packages/types'],
      imports: [
        // presets
        '@vueuse/core',
        'pinia',
        'vue',
        'vue-router',
        {
          'vue-i18n': ['useI18n', 'createI18n'],
        },
        {
          from: 'vue-router',
          imports: ['RouteLocationNamedRaw'],
          type: true,
        },
      ],
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },

  resolve: {
    dedupe: ['pinia', 'vue', 'vue-i18n', 'vue-router', '@vueuse/core'],
    alias: {
      '~': path.resolve(__dirname, './src'),
      '~translations': path.resolve(__dirname, 'translations'),
      '~types': path.resolve(__dirname, 'types'),
      '~dm-types': path.resolve(__dirname, '../../packages/types'),
      '~dm-services': path.resolve(__dirname, '../../packages/api/services'),
      '~group-by': path.resolve(__dirname, '../../util/group-by'),
      '~prisma-schemas': path.resolve(__dirname, '../../packages/prisma-schemas'),
      '~web': path.resolve(__dirname, '../web'),
      '~socket.io-services': path.resolve(__dirname, '../../packages/socket.io-services'),
      '~socket.io-client-services': path.resolve(__dirname, '../../packages/socket.io-client-services'),
    },
  },
});
