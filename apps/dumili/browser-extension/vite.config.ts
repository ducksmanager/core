import { defineConfig } from "vite";
import path, { resolve } from "path";
import fs from "fs";

export default defineConfig({
  build: {
    outDir: "dist",
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "style.[ext]",
      },
    },
  },
  plugins: [
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
      },
    },
  ],

  resolve: {
    alias: {
      "~dumili": path.resolve(__dirname, ".."),
    },
  },

  assetsInclude: ["**/*.html"],

  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
});
