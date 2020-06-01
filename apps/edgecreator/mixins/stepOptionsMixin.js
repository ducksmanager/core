import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'

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
    },
    ...mapMutations('currentStep', ['setStepNumber'])
  },
  mounted() {
    const vm = this
    if (this.svgGroup) {
      this.copyOptions(this.getOptionsFromSvgGroup())
    } else if (this.dbOptions) {
      this.copyOptions(this.getOptionsFromDb())
    }
    this.onOptionsSet()
    this.$root.$on('set-option', (optionName, optionValue) => {
      if (vm.currentStepNumber === vm.stepNumber) {
        Vue.set(vm.options, optionName, optionValue)
      }
    })
  }
}
