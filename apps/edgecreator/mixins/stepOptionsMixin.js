import { mapState } from 'vuex'
import textTemplateMixin from '@/mixins/textTemplateMixin'

const interact = require('interactjs')

export default {
  mixins: [textTemplateMixin],
  props: {
    issuenumber: { type: String },
    dimensions: { type: Object },
    stepNumber: { type: Number },
  },

  computed: {
    ...mapState('ui', ['zoom']),
    width() {
      return this.dimensions.width
    },
    height() {
      return this.dimensions.height
    },
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
  },
  methods: {
    isColorOption(optionName) {
      return optionName.toLowerCase().includes('color') || ['fill', 'stroke'].includes(optionName)
    },
    enableDragResize(element, { onmove = null, onresizemove = null } = {}) {
      const vm = this
      interact(element)
        .draggable({
          onmove: (e) => {
            document.body.classList.add('interacting')
            if (onmove) {
              onmove(e)
            } else {
              const { dx, dy } = e
              vm.$root.$emit('set-options', {
                x: vm.options.x + dx / vm.zoom / 3,
                y: vm.options.y + dy / vm.zoom / 3,
              })
            }
          },
          onend: () => {
            document.body.classList.remove('interacting')
          },
        })
        .resizable({
          edges: { right: true, bottom: true },
        })
        .on('resizemove', (e) => {
          document.body.classList.add('interacting')
          if (onresizemove) {
            onresizemove(e)
          } else {
            const { rect } = e
            const { width, height } = rect
            vm.$root.$emit('set-options', {
              width: width / vm.zoom,
              height: height / vm.zoom,
            })
          }
        })

        .on('resizeend', () => {
          document.body.classList.remove('interacting')
        })
    },
  },
  mounted() {
    const { issuenumber, stepNumber } = this
    this.$root.$emit('set-options', { ...this.options, issuenumbers: [issuenumber], stepNumber })
  },
}
