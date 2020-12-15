export default {
  install: function (Vue) {
    Vue.mixin({
      computed: ['locale', 'l10nUrl', 'imagePath', 'commit', 'userId', 'username'].reduce((acc, key) => ({
        ...acc,
        [key]: () => window[key] || undefined
      }), {})
    })
  }
}