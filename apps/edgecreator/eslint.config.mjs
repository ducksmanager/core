import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
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
      "**/bundle.mjs",
      "**/*.d.ts",
      "**/vendor",
      "**/vite.config.ts",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/stylistic",
      "plugin:vue/vue3-recommended",
      "plugin:prettier-vue/recommended",
      "prettier",
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
    },

    rules: {
      "eslint-comments/no-unused-disable": "off",

      // Disable this lint rule because it crashes eslint when linting an enum:
      // TypeError: Cannot read properties of undefined (reading 'members')
      "@typescript-eslint/no-duplicate-enum-values": "off",

      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-destructure": "off",
      "vue/no-v-html": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "vue/define-emits-declaration": "error",
      "vue/define-props-declaration": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

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
    files: ["**/*.ts", "**/*.vue"],
  },
];
