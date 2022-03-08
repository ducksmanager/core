export default () => {
  const messages = require('../locales/fr-FR.json')
  return Promise.resolve(
    Object.keys(messages).reduce((acc, value) => ({ ...acc, [value]: value }), {})
  )
}
