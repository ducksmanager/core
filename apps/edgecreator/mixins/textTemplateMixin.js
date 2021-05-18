const TEMPLATES = [
  {
    regex: /\[Hauteur]\*([.0-9]+)/g,
    replaceCallback({ dimensions: { height } }, coefficient) {
      return parseFloat(height) * coefficient
    },
  },
  {
    regex: /\[Numero]/g,
    replaceCallback({ issuenumber }) {
      return issuenumber
    },
  },
  {
    regex: /\[Numero\[(\d)]]/g,
    replaceCallback({ issuenumber }, digitIndex) {
      return issuenumber[parseInt(digitIndex)]
    },
  },
]

export default {
  data: () => ({
    attributeKeys: [],
  }),
  methods: {
    resolveStringTemplates(text, data = this) {
      if (!text) {
        return text
      }
      return TEMPLATES.reduce(
        (text, { regex, replaceCallback }) =>
          text.replaceAll(regex, (_match, group) => replaceCallback(data, group)),
        text
      )
    },
  },
}
