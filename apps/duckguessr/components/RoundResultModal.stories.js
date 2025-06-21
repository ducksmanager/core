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
  roundUrl: 'thumbnails3/webusers/2014/04/hu_mm1992_07e_001.jpg',
  correctAuthor: {
    personcode: 'DR',
    personfullname: 'Don Rosa',
    personnationality: 'us',
  },
  nextRoundStartDate: futureDate,
  hasEverybodyGuessed: false,
}

export const Incorrect = Template.bind({})
Incorrect.args = {
  status: 'danger',
  roundNumber: 1,
  speedBonus: 0,
  roundUrl: 'thumbnails3/webusers/2017/03/it_om_1341g_001.jpg',
  correctAuthor: {
    personcode: 'CB',
    personfullname: 'Carl Barks',
    personnationality: 'us',
  },
  nextRoundStartDate: futureDate,
  hasEverybodyGuessed: false,
}

export const LastRound = Template.bind({})
LastRound.args = {
  status: 'success',
  roundNumber: 7,
  speedBonus: 12,
  roundUrl: 'webusers/webusers-auth/rsc_ommi0o.png',
  correctAuthor: {
    personcode: 'CB',
    personfullname: 'Carl Barks',
    personnationality: 'us',
  },
  nextRoundStartDate: null,
  hasEverybodyGuessed: false,
}
