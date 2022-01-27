import RoundResultModal from '~/components/RoundResultModal'

export default {
  title: 'RoundResultModal',
}

const Template = (args) => ({
  components: { RoundResultModal },
  setup() {
    return { args }
  },
  template: '<RoundResultModal v-bind="args" />',
})
export const Default = Template.bind({})
const futureDate = new Date()
futureDate.setMinutes(futureDate.getMinutes() + 1)
Default.args = {
  status: 'success',
  roundNumber: 1,
  correctAnswer: 'DR',
  nextRoundStartDate: futureDate,
}
