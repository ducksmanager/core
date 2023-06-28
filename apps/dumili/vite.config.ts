import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
export default defineConfig({
  plugins: [
    vue(),
    Components({
      /* options */
    }),
  ],
});
