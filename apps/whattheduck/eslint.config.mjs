import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import vueI18n from '@intlify/eslint-plugin-vue-i18n';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import parser from 'vue-eslint-parser';

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
      '**/.vscode',
      '**/android',
      '**/dist',
      '**/DerivedData',
      '**/ios',
      '**/node_modules',
      'auto-imports.d.ts',
      'components.d.ts',
      '**/*.json',
    ],
  },
  ...vueI18n.configs['flat/recommended'],
  ...compat.extends(
    'plugin:vue/recommended',
    'plugin:prettier-vue/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ),

  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },

    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/no-dupe-keys': 'off',
      'vue/no-setup-props-reactivity-loss': 'off',
      'vue/no-v-html': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/define-emits-declaration': 'error',
      'vue/define-props-declaration': 'error',
      'vue/no-unused-properties': 'error',

      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],

      '@intlify/vue-i18n/no-deprecated-i18n-component': 'off',
      '@intlify/vue-i18n/no-raw-text': [
        'warn',
        {
          ignoreText: ['YouTube', 'Discord', 'Facebook', 'Instagram', 'DucksManager', '+ ', ' +', '€'],
        },
      ],
    },

    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: ['./translations/*.json'],
          localeKey: 'file',
        },
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
  },
];
