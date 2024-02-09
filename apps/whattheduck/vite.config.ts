import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { IonicResolver } from 'unplugin-vue-components/resolvers';
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";

import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8005,
  },
  plugins: [
    vue(),
    ReactivityTransform(),
    Components({
      resolvers: [IonicResolver()],
      dts: true,
    }),

    AutoImport({
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
      dirs: ['../web/src/composables', '../web/src/stores', "../../packages/types"],
      imports: [
        // presets
        'pinia',
        'vue',
        "vue/macros",
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
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '~translations': path.resolve(__dirname, 'translations'),
      '~types': path.resolve(__dirname, 'types'),
      '~dm-types': path.resolve(__dirname, '../../packages/types'),
      '~dm-services': path.resolve(__dirname, '../../packages/api/services'),
      '~prisma-clients': path.resolve(__dirname, '../../packages/prisma-clients'),
      '~web': path.resolve(__dirname, '../../apps/web'),
      '~socket.io-services': path.resolve(__dirname, '../../packages/socket.io-services'),
      '~socket.io-client-services': path.resolve(__dirname, '../../packages/socket.io-client-services')
    },
  },
});
