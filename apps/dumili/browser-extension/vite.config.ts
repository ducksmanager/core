import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path, { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
    {
      name: "copy-files",
      writeBundle() {
        const distDir = resolve(__dirname, "dist");
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }

        fs.copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(distDir, "manifest.json"),
        );

        const componentsDir = resolve(__dirname, "src/components");
        const distComponentsDir = resolve(distDir, "components");

        if (!fs.existsSync(distComponentsDir)) {
          fs.mkdirSync(distComponentsDir, { recursive: true });
        }

        const files = fs.readdirSync(componentsDir);
        files.forEach((file) => {
          fs.copyFileSync(
            resolve(componentsDir, file),
            resolve(distComponentsDir, file),
          );
        });
      },
    },
  ],
  build: {
    minify: false,
    outDir: "dist",
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "content.js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name === "style.css" ? "content.css" : assetInfo.name,
      },
    },
  },
  resolve: {
    alias: {
      "~dumili": path.resolve(__dirname, ".."),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "sass:color";`,
      },
    },
  },
});
