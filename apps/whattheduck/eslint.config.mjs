import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import i18Next from 'eslint-plugin-i18next';
import _import from 'eslint-plugin-import';
import globals from 'globals';
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
    ignores: ['**/.vscode', '**/android', '**/dist', '**/DerivedData', '**/ios', '**/node_modules', 'auto-imports.d.ts', 'components.d.ts'],
  },
  ...fixupConfigRules(
    compat.extends(
      './.eslintrc-auto-import.json',
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/stylistic',
      'plugin:i18next/recommended',
      'plugin:import/typescript',
      'plugin:prettier-vue/recommended',
      'prettier',
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      i18next: fixupPluginRules(i18Next),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: parser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        project: true,
      },
    },

    rules: {
      'no-fallthrough': 'off',
      'no-constant-condition': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],

      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      'i18next/no-literal-string': [
        'error',
        {
          words: { exclude: ['Discord', 'Facebook', 'Instagram', 'YouTube', '+&nbsp;'] },
        },
      ],
      'import/first': 'error',

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },

          groups: [['builtin', 'external'], 'parent', ['sibling', 'index']],
          'newlines-between': 'always',
        },
      ],

      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
  },
];
