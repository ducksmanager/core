import messages from '@/locales/fr-FR.json'

export default async () =>
  Promise.resolve(
    Object.keys(messages).reduce(
      (acc, value) => ({ ...acc, [value]: value }),
      {}
    )
  )
