import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import parser from "vue-eslint-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/shims.d.ts",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "plugin:vue/vue3-recommended",
      "plugin:prettier-vue/recommended",
      "prettier",
      "plugin:@typescript-eslint/recommended",
    ),
  ),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "arrow-body-style": ["error", "as-needed"],
      "vue/multi-word-component-names": "off",
      "vue/no-dupe-keys": "off",
      "vue/no-setup-props-destructure": "off",
      "vue/no-v-html": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "vue/define-emits-declaration": "error",
      "vue/define-props-declaration": "error",

      "vue/component-name-in-template-casing": [
        "error",
        "kebab-case",
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],
  },
];
