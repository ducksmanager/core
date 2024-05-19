import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import tscAlias from "rollup-plugin-tsc-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import esmShim from "@rollup/plugin-esm-shim";
import { readFileSync, writeFileSync } from "fs";

const esmShimFixPlugin = () => ({
  name: "plugin-esm-shim",
  writeBundle: async (options) => {
    const file = options.file;
    const lines = readFileSync(file, "utf-8").split("\n");

    const X = lines.findIndex((line) => /^\/\/ -- Shims --/.test(line)) + 1;
    const Y = lines.findIndex((line) => /^const require =/.test(line)) + 1;
    const Z = lines.findIndex((line) => line === "") + 1;

    const movingLines = lines.slice(X - 1, Y);
    lines.splice(X - 1, Y - X + 1);
    lines.splice(Z - 1, 0, ...movingLines);
    writeFileSync(file, lines.join("\n"));
  },
});

export default () => ({
  input: "dist/apps/edgecreator/api/index.js",
  output: {
    file: "dist/bundle.js",
  },
  plugins: [
    resolve(),
    typescript(),
    tscAlias(),
    commonjs(),
    json(),
    esmShim(),
    esmShimFixPlugin(),
  ],
});
