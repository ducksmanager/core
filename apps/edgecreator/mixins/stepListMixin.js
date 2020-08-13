import Vue from 'vue'

export default {
  data: () => ({
    steps: {},
  }),
  mounted() {
    const vm = this
    this.$root.$on('set-options', (changes) => {
      Object.keys(vm.steps)
        .filter((issuenumber) => issuenumber === vm.editingIssuenumber || vm.locked)
        .forEach((issuenumber) => {
          Object.keys(changes).forEach((optionName) => {
            Vue.set(
              vm.steps[issuenumber][vm.editingStepNumber].options,
              optionName,
              changes[optionName]
            )
          })
        })
    })
  },

  methods: {
    checkSameComponentsAsPreviousIssue(issuenumber, issueSteps) {
      const previousIssuenumber = Object.keys(this.steps)[Object.keys(this.steps).length - 1]
      const previousIssueSteps = this.steps[previousIssuenumber]
      const getComponents = (steps) => steps.map(({ component }) => component).join('+')
      if (previousIssueSteps && getComponents(previousIssueSteps) !== getComponents(issueSteps)) {
        throw new Error(
          `Issue numbers ${previousIssuenumber} and ${issuenumber} don't have the same components` +
            `: ${getComponents(previousIssueSteps)} vs ${getComponents(issueSteps)}`
        )
      }
    },
    setSteps(issuenumber, issueSteps) {
      this.checkSameComponentsAsPreviousIssue(issuenumber, issueSteps)
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
