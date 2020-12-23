export default {
  install: function (Vue, options = {}) {
    Vue.mixin({
      computed: ['locale', 'l10nUrl', 'imagePath', 'commit', 'userId', 'username'].reduce((acc, key) => {
        const value = (options.overrides && options.overrides[key]) || window[key] || undefined
        return value !== undefined ? {
          ...acc,
          [key]: () => value
        } : acc;
      }, {})
    })
  }
}
