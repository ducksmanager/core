import { mapState, mapMutations } from 'vuex'

const interact = require('interactjs')

const TEMPLATES = [
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
  props: {
    issuenumber: { type: String },
    stepNumber: { type: Number },
  },

  computed: {
    ...mapState(['width', 'height']),
    ...mapState('ui', ['zoom']),
    attributes() {
      const vm = this
      return Object.keys(this.options)
        .filter((optionKey) => vm.attributeKeys.includes(optionKey))
        .reduce(
          (acc, optionKey) => ({
            ...acc,
            [optionKey]: vm.options[optionKey],
          }),
          {}
        )
    },
    colors() {
      return Object.keys(this.options || {})
        .filter(
          (optionName) =>
            this.isColorOption(optionName) && this.options[optionName] !== 'transparent'
        )
        .map((optionName) => this.options[optionName])
    },
  },
  watch: {
    colors: {
      immediate: true,
      handler(newColors) {
        this.setStepColors({ stepNumber: this.stepNumber, colors: newColors })
      },
    },
  },
  methods: {
    resolveStringTemplates(text) {
      if (!text) {
        return text
      }
      const data = { issuenumber: this.issuenumber }
      return TEMPLATES.reduce(
        (text, { regex, replaceCallback }) =>
          text.replaceAll(regex, (_match, group) => replaceCallback(data, group)),
        text
      )
    },
    isColorOption(optionName) {
      return optionName.toLowerCase().includes('color') || ['fill', 'stroke'].includes(optionName)
    },
    enableDragResize(image, { onmove = null, onresizemove = null } = {}) {
      const vm = this
      interact(image)
        .draggable({
          onmove:
            onmove ||
            (({ dx, dy }) => {
              vm.$root.$emit('set-options', {
                x: vm.options.x + dx / vm.zoom / 3,
                y: vm.options.y + dy / vm.zoom / 3,
              })
            }),
        })
        .resizable({
          edges: { right: true, bottom: true },
        })
        .on(
          'resizemove',
          onresizemove ||
            (({ rect }) => {
              let { width, height } = rect
              if ([90, 270].includes(vm.options.rotation)) {
                ;[width, height] = [height, width]
              }
              vm.$root.$emit('set-options', {
                width: width / vm.zoom,
                height: height / vm.zoom,
              })
            })
        )
    },
    ...mapMutations(['setStepColors']),
  },
  mounted() {
    const { issuenumber, stepNumber } = this
    this.$root.$emit('set-options', { ...this.options, issuenumber, stepNumber })
  },
}
