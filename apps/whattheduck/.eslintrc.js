module.exports = {
  env: {
    browser: true,
  }, extends: [
    "plugin:import/typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier-vue/recommended",
    './.eslintrc-auto-import.json',
  ],
  plugins: ["simple-import-sort", "@typescript-eslint", "unused-imports"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  },
  overrides: [
    {
      files: ["*.js", "*.ts", "*.vue"],
    },
  ],
  ignorePatterns: [
    "**/.vscode",
    "**/android",
    "**/dist",
    "**/ios",
    "**/node_modules",
    "/.eslintrc.js",
  ],
  plugins: ["import", "@typescript-eslint"],
  rules: {
    // https://eslint.org/docs/rules/
    "no-fallthrough": "off", // https://github.com/ionic-team/eslint-config/issues/7
    "no-constant-condition": "off",

    "vue/multi-word-component-names": "off",

    'vue/no-deprecated-slot-attribute': 'off',

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": ["error", { "allowArgumentsExplicitlyTypedAsAny": true }],

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-optional-chain": "error",

    // https://github.com/benmosher/eslint-plugin-import
    "import/first": "error",
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": false },
        "groups": [["builtin", "external"], "parent", ["sibling", "index"]],
        "newlines-between": "always"
      }
    ],
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/no-mutable-exports": "error"
  }
}
