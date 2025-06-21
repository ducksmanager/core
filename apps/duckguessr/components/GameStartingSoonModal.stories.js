import GameStartingSoonModal from '~/components/GameStartingSoonModal'

export default {
  title: 'GameStartingSoonModal',
}

const Template = (args) => ({
  components: { GameStartingSoonModal },
  setup() {
    return { args }
  },
  template: '<GameStartingSoonModal v-bind="args" />',
})
export const Default = Template.bind({})
const futureDate = new Date()
futureDate.setSeconds(futureDate.getSeconds() + 20)
Default.args = {
  authors: [
    { personcode: 'CB', personnationality: 'us', personfullname: 'Carl Barks' },
    { personcode: 'DR', personnationality: 'us', personfullname: 'Don Rosa' },
    { personcode: 'RSc', personnationality: 'us', personfullname: 'Romano Scarpa' },
    { personcode: 'CB', personnationality: 'us', personfullname: 'Carl Barks' },
    { personcode: 'DR', personnationality: 'us', personfullname: 'Don Rosa' },
    { personcode: 'RSc', personnationality: 'us', personfullname: 'Romano Scarpa' },
    { personcode: 'CB', personnationality: 'us', personfullname: 'Carl Barks' },
    { personcode: 'DR', personnationality: 'us', personfullname: 'Don Rosa' },
    { personcode: 'RSc', personnationality: 'us', personfullname: 'Romano Scarpa' },
  ],
  firstRoundStartDate: futureDate,
}
