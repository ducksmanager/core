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
    "vue/no-v-html": "off",
    "vue/no-setup-props-destructure": "off",
    "vue/multi-word-component-names": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  plugins: ["simple-import-sort", "@typescript-eslint"],
  ignorePatterns: [
    "**/node_modules",
    "gateway/dist",
    "gateway/prisma/generated",
  ],
};
