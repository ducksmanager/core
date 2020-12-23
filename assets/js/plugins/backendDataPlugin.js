export default {
  install: function (Vue, options = {}) {
    Vue.mixin({
      computed: ['locale', 'l10nUrl', 'imagePath', 'commit', 'userId', 'username'].reduce((acc, key) => ({
        ...acc,
        [key]: () => (options.overrides && options.overrides[key]) || localStorage.getItem(key) || undefined
      }), {})
    })
  }
}
