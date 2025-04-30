import { defineConfig } from "vite";
import path, { resolve } from "path";
import fs from "fs";
import vue from "@vitejs/plugin-vue";

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

        // Copy manifest
        fs.copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(distDir, "manifest.json"),
        );

        // Copy components directory
        const componentsDir = resolve(__dirname, "src/components");
        const distComponentsDir = resolve(distDir, "components");

        if (!fs.existsSync(distComponentsDir)) {
          fs.mkdirSync(distComponentsDir, { recursive: true });
        }

        // Copy all files from components directory
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "content.css";
          return assetInfo.name;
        },
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
