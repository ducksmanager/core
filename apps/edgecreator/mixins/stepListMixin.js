import Vue from 'vue'

export default {
  data: () => ({
    steps: {},
  }),
  methods: {
    setSteps(issuenumber, issueSteps) {
      Vue.set(this.steps, issuenumber, issueSteps)
    },
    copySteps(issuenumber, otherIssuenumber) {
      Vue.set(this.steps, issuenumber, { ...this.steps[otherIssuenumber] })
    },
    addStep(component) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        Vue.set(vm.steps[issuenumber], vm.steps[issuenumber].length, { component })
      })
    },
    removeStep(stepNumber) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        vm.steps[issuenumber].splice(stepNumber, 1)
      })
    },
    duplicateStep(stepNumber) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        const existingStep = vm.steps[issuenumber][stepNumber]
        vm.steps[issuenumber].splice(stepNumber, 0, {
          component: existingStep.component,
          options: { ...existingStep.options },
        })
      })
    },
    swapSteps(stepNumbers) {
      const vm = this
      Object.keys(vm.steps).forEach((issuenumber) => {
        const steps = vm.steps[issuenumber]
        const stepsToSwap = [steps[stepNumbers[0]], steps[stepNumbers[1]]]
        vm.steps[issuenumber].splice(stepNumbers[0], 2, stepsToSwap[1], stepsToSwap[0])
      })
    },
  },
}
