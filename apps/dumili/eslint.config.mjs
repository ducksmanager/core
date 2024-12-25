import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import vueI18n from "@intlify/eslint-plugin-vue-i18n";
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
      "api/**/*",
      "**/*.d.ts",
      "**/dist",
      "**/node_modules",
      "**/*.json",
      "**/*.yml",
    ],
  },
  ...vueI18n.configs["flat/recommended"],
  ...compat.extends(
    "plugin:vue/vue3-recommended",
    "plugin:prettier-vue/recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ),

  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
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
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "arrow-body-style": ["error", "as-needed"],
      "vue/multi-word-component-names": "off",
      "vue/no-dupe-keys": "off",
      "vue/no-setup-props-destructure": "off",
      "vue/no-v-html": "off",
      "vue/no-v-text-v-html-on-component": "off",
      "vue/define-emits-declaration": "error",
      "vue/define-props-declaration": "error",
      "vue/no-unused-properties": "error",

      "vue/component-name-in-template-casing": [
        "error",
        "kebab-case",
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],

      "@intlify/vue-i18n/no-deprecated-i18n-component": "off",
      "@intlify/vue-i18n/no-raw-text": [
        "warn",
        {
          ignoreText: [
            "DuMILi",
            "DucksManager",
            "OK",
            "11zon.com",
            " - ",
            "DucksManager Inducks Little helper",
          ],
        },
      ],
    },

    settings: {
      "vue-i18n": {
        localeDir: {
          pattern: ["./translations/*.json", "../web/translations/*.json"],
          localeKey: "file",
        },
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.vue"],
  },
];
