import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
const interact = require('interactjs')

export default {
  props: {
    stepNumber: { type: Number },
    svgGroup: { type: Object },
    dbOptions: { type: Object }
  },
  data() {
    return {
      options: {}
    }
  },
  computed: {
    ...mapState(['zoom', 'width', 'height', 'edge']),
    ...mapState('currentStep', {
      currentStepNumber: 'stepNumber'
    }),
    svgMetadata() {
      return (
        this.svgGroup &&
        JSON.parse(
          this.svgGroup.getElementsByTagName('metadata')[0].textContent
        )
      )
    }
  },
  watch: {
    currentStepNumber: {
      immediate: true,
      handler(newValue) {
        if (newValue === this.stepNumber) {
          this.$emit('update', this.options)
        }
      }
    },
    options: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        if (this.currentStepNumber === this.stepNumber) {
          this.$emit('update', newValue, oldValue)
        }
      }
    }
  },
  methods: {
    copyOptions(options) {
      const optionsKeys = Object.keys(options)
      const optionsClone = {}
      optionsKeys.forEach((propKey) => {
        Vue.set(optionsClone, propKey, options[propKey])
      })
      this.options = optionsClone
    },
    enableDragResize(image, { onmove = null, onresizemove = null } = {}) {
      const vm = this
      interact(image)
        .draggable({
          onmove:
            onmove ||
            (({ dx, dy }) => {
              vm.options.x += dx / vm.zoom
              vm.options.y += dy / vm.zoom
            })
        })
        .resizable({
          edges: { right: true, bottom: true }
        })
        .on(
          'resizemove',
          onresizemove ||
            (({ rect }) => {
              vm.options.width = rect.width / vm.zoom
              vm.options.height = rect.height / vm.zoom
            })
        )
    },
    ...mapMutations('currentStep', ['setStepNumber'])
  },
  async mounted() {
    const vm = this
    if (this.svgMetadata) {
      this.copyOptions(this.svgMetadata)
    } else if (this.dbOptions) {
      this.copyOptions(await this.getOptionsFromDb())
    }
    this.onOptionsSet()
    this.$root.$on('set-option', (optionName, optionValue) => {
      if (vm.currentStepNumber === vm.stepNumber) {
        vm.options[optionName] = optionValue
      }
    })
  }
}
