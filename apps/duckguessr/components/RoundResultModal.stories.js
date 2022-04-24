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
futureDate.setSeconds(futureDate.getSeconds() + 20)
Default.args = {
  status: 'success',
  roundNumber: 1,
  speedBonus: 65,
  correctAuthor: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
  nextRoundStartDate: futureDate,
}

export const Incorrect = Template.bind({})
Incorrect.args = {
  status: 'danger',
  roundNumber: 1,
  correctAuthor: {
    personcode: 'CB',
    personfullname: 'Carl Barks',
    personnationality: 'us',
  },
  nextRoundStartDate: futureDate,
}

export const LastRound = Template.bind({})
LastRound.args = {
  status: 'success',
  roundNumber: 7,
  correctAuthor: {
    personcode: 'CB',
    personfullname: 'Carl Barks',
    personnationality: 'us',
  },
  nextRoundStartDate: null,
}
