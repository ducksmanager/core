export default () =>
  Promise.resolve(
    Object.keys(require('../locales/fr-FR.json')).reduce(
      (acc, value) => ({ ...acc, [value]: value }),
      {}
    )
  )
