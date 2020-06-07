export default function({ $axios, app }) {
  $axios.interceptors.request.use(function(config) {
    if (/^\/(api|fs\/text)/.test(config.url)) {
      if (app.$cookies.get('dm-user')) {
        config.headers['x-dm-user'] = app.$cookies.get('dm-user')
      }
      if (app.$cookies.get('dm-pass')) {
        config.headers['x-dm-pass'] = app.$cookies.get('dm-pass')
      }
    }
    return config
  })
}
