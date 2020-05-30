import Vue from 'vue'
import { mapState } from 'vuex'

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
    })
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
      handler(newValue) {
        if (this.currentStepNumber === this.stepNumber) {
          this.$emit('update', newValue)
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
      this.onOptionsSet()
    }
  },
  mounted() {
    const vm = this
    this.copyOptions(
      this.svgGroup ? this.getOptionsFromSvgGroup() : this.getOptionsFromDb()
    )
    this.$root.$on('set-option', (optionName, optionValue) => {
      if (vm.currentStepNumber === vm.stepNumber) {
        Vue.set(vm.options, optionName, optionValue)
      }
    })
  }
}
