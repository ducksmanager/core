export default {
  methods: {
    removeVueMarkup(element) {
      const vm = this
      Object.values(element.attributes || {})
        .filter((attribute) => attribute.name.startsWith('data-v-'))
        .forEach(({ name: attributeName }) => {
          element.removeAttribute(attributeName)
        })
      Object.values(element.childNodes).forEach((childNode) => {
        vm.removeVueMarkup(childNode)
      })
      return element
    },
    saveEdgeSvg(
      country,
      magazine,
      issuenumber,
      contributors,
      withExport = false,
      withSubmit = false
    ) {
      const vm = this
      const svgElementId = `edge-canvas-${issuenumber}`
      const cleanSvg = this.removeVueMarkup(
        document.getElementById(svgElementId).cloneNode(true)
      )
      if (!cleanSvg) {
        return Promise.reject(
          new Error(`Couldn't save SVG : empty content for ID ${svgElementId}`)
        )
      }
      return vm.$axios.$put('/fs/save', {
        runExport: withExport,
        runSubmit: withSubmit,
        country,
        magazine,
        issuenumber,
        contributors,
        content: cleanSvg.outerHTML,
      })
    },
  },
}
