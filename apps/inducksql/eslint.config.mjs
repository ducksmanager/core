import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import prettierVue from "eslint-plugin-prettier-vue";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import parser from "vue-eslint-parser";

import apiRules from "../../util/lint/api-rules.mjs";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs["flat/recommended"],
  prettierConfig,
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/bundle.mjs",
      "**/*.d.ts",
      "coa.sqlite",
      "eslint.config.mjs",
    ],
  },

  // prettier-vue uses legacy context.getSourceCode(); wrap for ESLint 10.
  {
    plugins: {
      "prettier-vue": fixupPluginRules(prettierVue),
    },
    rules: {
      "prettier-vue/prettier": "error",
    },
  },

  {
    languageOptions: {
      parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      ...apiRules,
      "arrow-body-style": ["error", "as-needed"],
      "vue/multi-word-component-names": "off",
      "vue/no-dupe-keys": "off",
      "vue/no-setup-props-reactivity-loss": "off",
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
    },
  },
  {
    // typescript-eslint turns no-undef off for .ts only; vue-tsc covers SFCs just the same.
    files: ["**/*.vue"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.vue"],
  },
);
