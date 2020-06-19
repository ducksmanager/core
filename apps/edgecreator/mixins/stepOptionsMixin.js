import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
const interact = require('interactjs')

export default {
  props: {
    issuenumber: { type: String },
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
    ...mapState(['zoom', 'width', 'height']),
    ...mapState('editingStep', {
      currentIssuenumber: 'issuenumber',
      currentStepNumber: 'stepNumber',
      currentStepOptions: 'stepOptions'
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
      handler(newStepNumber) {
        if (this.isEditingCurrentStep(newStepNumber, this.currentIssuenumber)) {
          this.setStepOptions(this.options)
        }
      }
    },
    currentIssuenumber: {
      immediate: true,
      handler(newIssuenumber) {
        if (this.isEditingCurrentStep(this.currentStepNumber, newIssuenumber)) {
          this.setStepOptions(this.options)
        }
      }
    },
    options: {
      deep: true,
      immediate: true,
      handler(newOptions) {
        if (
          this.isEditingCurrentStep(
            this.currentStepNumber,
            this.currentIssuenumber
          )
        ) {
          this.setStepOptions(newOptions)
        }
      }
    }
  },
  methods: {
    isEditingCurrentStep(currentStepNumber, currentIssuenumber) {
      return (
        currentStepNumber === this.stepNumber &&
        currentIssuenumber === this.issuenumber
      )
    },
    setStepOptions(options) {
      const newOptions = {}
      Object.keys(options).forEach((optionKey) => {
        Vue.set(newOptions, optionKey, options[optionKey])
      })
      this.setCurrentStepOptions(newOptions)
    },
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
    ...mapMutations('editingStep', { setCurrentStepOptions: 'setStepOptions' })
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
      if (
        vm.isEditingCurrentStep(vm.currentStepNumber, vm.currentIssuenumber)
      ) {
        vm.options[optionName] = optionValue
      }
    })
  }
}
