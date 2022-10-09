module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/vue3-recommended",
    "plugin:prettier-vue/recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
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
