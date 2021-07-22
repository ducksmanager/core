exports.config = {
  tests: './test/*.js',
  output: './test/output',
  helpers: {
    Playwright: {
      url: 'http://localhost:3000',
      show: true,
      browser: 'firefox',
    },
  },
  bootstrap: null,
  mocha: {},
  name: 'duckguessr',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
}
