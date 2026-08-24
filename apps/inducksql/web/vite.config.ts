import Vue from "@vitejs/plugin-vue";
import * as path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const artifact = "/coa.sqlite";

export default defineConfig({
  // The config is loaded from the package root, so the app root has to be stated explicitly.
  root: dirname,
  plugins: [Vue()],
  // sqlite-wasm ships its own .wasm and must not be pre-bundled.
  optimizeDeps: { exclude: ["@sqlite.org/sqlite-wasm"] },
  worker: { format: "es" },
  build: { outDir: path.resolve(dirname, "../dist"), emptyOutDir: true },
  server: {
    proxy: {
      [artifact]: { target: "http://localhost:8901", changeOrigin: true },
    },
  },
});
