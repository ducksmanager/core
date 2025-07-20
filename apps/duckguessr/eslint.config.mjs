import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import parser from "vue-eslint-parser";
// import globals from "globals";

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
      "storybook-static",
      "**/node_modules",
      "**/client_*",
      "**/dist",
      "**/shims.d.ts",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "plugin:vue/recommended",
      "plugin:prettier-vue/recommended",
      "prettier",
      "plugin:@typescript-eslint/recommended",
      "plugin:storybook/recommended",
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
        parser: typescriptParser,
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      camelcase: "off",
      "no-console": "off",
      "node/no-callback-literal": "off",
      "import/default": "off",
      "import/named": "off",
      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },

          svg: "always",
          math: "always",
        },
      ],

      "vue/max-len": [
        2,
        {
          code: 110,
          tabWidth: 4,
          ignoreUrls: true,
          ignoreStrings: true,
        },
      ],

      "vue/multi-word-component-names": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],
  },
];
