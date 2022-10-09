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
    "@typescript-eslint/no-non-null-assertion": "off",
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "vue/multi-word-component-names": "off",
    "vue/no-setup-props-destructure": "off",
    "vue/no-v-html": "off",
  },
  plugins: ["simple-import-sort", "@typescript-eslint"],
  ignorePatterns: ["**/node_modules", "**/dist", "shims.d.ts", "vendor"],
};
