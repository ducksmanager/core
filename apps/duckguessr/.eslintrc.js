module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/vue3-recommended",
    "plugin:prettier-vue/recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "vue-eslint-parser",
  parserOptions: { parser: "@typescript-eslint/parser" },
  overrides: [
    {
      files: ["*.js", "*.ts", "*.vue"],
    },
  ],
  root: true,
  rules: {
    "object-shorthand": ["error", "always"],
    "@typescript-eslint/no-non-null-assertion": "off",
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "arrow-body-style": ["error", "as-needed"],
    "unused-imports/no-unused-imports": "error",
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
  plugins: ["simple-import-sort", "@typescript-eslint", "unused-imports"],
  ignorePatterns: [
    "**/node_modules",
    "**/dist",
    "shims.d.ts",
    "vendor",
    "auto-imports.d.ts",
    "component.d.ts",
  ],
};
