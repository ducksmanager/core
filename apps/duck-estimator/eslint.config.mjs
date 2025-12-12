import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import apiRules from "../../util/lint/api-rules.mjs";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/bundle.mjs",
      "**/*.d.ts",
      "tsconfig.json",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: apiRules,
  },
  {
    files: ["**/*.ts"],
  },
);
