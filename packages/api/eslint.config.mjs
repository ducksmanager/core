import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import apiRules from "../../util/lint/api-rules.mjs";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  prettierPlugin,
  {
    ignores: [
      "**/*.d.ts",
      "**/bundle.mjs",
      "**/covers",
      "**/dist",
      "**/model",
      "**/node_modules",
      "**/venv",
      "eslint.config.mjs",
      "prisma/client_*",
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
