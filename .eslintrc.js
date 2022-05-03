module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/vue3-recommended",
    "plugin:prettier-vue/recommended",
    "prettier",
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    "vue/no-v-html": "off",
    "vue/multi-word-component-names": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  plugins: ["simple-import-sort"],
};
