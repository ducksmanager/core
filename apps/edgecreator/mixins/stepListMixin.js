import Vue from 'vue'

export default {
  data: () => ({
    steps: {},
  }),
  mounted() {
    const vm = this
    this.$root.$on('set-options', (changes) => {
      const { issuenumber, stepNumber, ...optionChanges } = { ...changes }
      const targetIssueNumber = issuenumber !== undefined ? issuenumber : vm.editingIssuenumber
      const targetStepNumber = stepNumber !== undefined ? stepNumber : vm.editingStepNumber
      Object.keys(vm.steps)
        .filter((issuenumber) => issuenumber === targetIssueNumber || vm.locked)
        .forEach((issuenumber) => {
          if (!vm.steps[issuenumber][targetStepNumber].options) {
            Vue.set(vm.steps[issuenumber][targetStepNumber], 'options', {})
          }
          Object.keys(optionChanges).forEach((optionName) => {
            Vue.set(
              vm.steps[issuenumber][targetStepNumber].options,
              optionName,
              optionChanges[optionName]
            )
          })
        })
    })
  },

  methods: {
    checkSameComponentsAsCompletedEdge(issuenumber, issueSteps) {
      const vm = this
      const completedIssuenumber = Object.keys(this.steps).find(
        (issueNumber) => vm.steps[issueNumber].length
      )
      const completedIssueSteps = this.steps[completedIssuenumber]
      const getComponents = (steps) => steps && steps.map(({ component }) => component).join('+')
      const previousIssueComponents = getComponents(completedIssueSteps)
      const currentIssueComponents = getComponents(issueSteps)
      if (
        completedIssuenumber !== issuenumber &&
        completedIssueSteps &&
        previousIssueComponents !== currentIssueComponents
      ) {
        throw new Error(
          this.$t(
            `Issue numbers {completedIssuenumber} and {issuenumber} ` +
              `don't have the same components` +
              `: {completedIssueSteps} vs {currentIssueComponents}`,
            {
              completedIssuenumber,
              issuenumber,
              previousIssueComponents,
              currentIssueComponents,
            }
          )
        )
      }
    },
    setSteps(issuenumber, issueSteps) {
      this.checkSameComponentsAsCompletedEdge(issuenumber, issueSteps)
      Vue.set(this.steps, issuenumber, issueSteps)
    },
    copySteps(issuenumber, otherIssuenumber) {
      Vue.set(this.steps, issuenumber, JSON.parse(JSON.stringify(this.steps[otherIssuenumber])))
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
