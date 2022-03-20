module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    'plugin:vue/recommended',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    camelcase: 'off',
    'no-console': 'off',
    'node/no-callback-literal': 'off',
    'import/default': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/max-len': [2, { code: 100, tabWidth: 4, ignoreUrls: true, ignoreStrings: true }],
    'vue/multi-word-component-names': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
}
