import Podium from '~/components/Podium'

export default {
  title: 'Podium',
}

const Template = (args) => ({
  components: { Podium },
  setup() {
    return { args }
  },
  template: '<Podium v-bind="args" />',
})
export const Default = Template.bind({})
const futureDate = new Date()
futureDate.setSeconds(futureDate.getSeconds() + 20)
Default.args = {
  players: [
    {
      id: 123,
      username: 'remifanpicsou',
      sum_score: 1000,
    },
    {
      id: 456,
      username: 'Wizyx',
      sum_score: 100,
    },
    {
      id: 789,
      username: 'brunoperel',
      sum_score: 20,
    },
    {
      id: 999,
      username: 'demo',
      sum_score: 10,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 1,
    },
  ],
}
