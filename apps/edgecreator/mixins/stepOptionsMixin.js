import { mapState, mapMutations } from 'vuex'
const interact = require('interactjs')

export default {
  props: {
    issuenumber: { type: String },
    stepNumber: { type: Number },
  },

  computed: {
    ...mapState(['width', 'height']),
    ...mapState('ui', ['zoom']),
    colors() {
      return Object.keys(this.options)
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
                x: vm.options.x + dx / vm.zoom,
                y: vm.options.y + dy / vm.zoom,
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
              vm.$root.$emit('set-options', {
                width: rect.width / vm.zoom,
                height: rect.height / vm.zoom,
              })
            })
        )
    },
    ...mapMutations(['setStepColors']),
  },
}
