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
      editingIssuenumber: 'issuenumber',
      editingStepNumber: 'stepNumber',
      editingStepOptions: 'stepOptions'
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
    editingStepNumber: {
      immediate: true,
      handler(newStepNumber) {
        if (this.isEditingCurrentStep(newStepNumber, this.editingIssuenumber)) {
          this.setStepOptions(this.options)
        }
      }
    },
    editingIssuenumber: {
      immediate: true,
      handler(newIssuenumber) {
        if (this.isEditingCurrentStep(this.editingStepNumber, newIssuenumber)) {
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
            this.editingStepNumber,
            this.editingIssuenumber
          )
        ) {
          this.setStepOptions(newOptions)
        }
      }
    }
  },
  methods: {
    isEditingCurrentStep(editingStepNumber, editingIssuenumber) {
      return (
        editingStepNumber === this.stepNumber &&
        editingIssuenumber === this.issuenumber
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
        vm.isEditingCurrentStep(vm.editingStepNumber, vm.editingIssuenumber)
      ) {
        vm.options[optionName] = optionValue
      }
    })
  }
}
