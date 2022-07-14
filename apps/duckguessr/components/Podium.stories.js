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
      sum_score: 19,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 18,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 17,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 16,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 15,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 14,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 13,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 12,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 11,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 10,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 9,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 8,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 7,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 6,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 5,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 4,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 3,
    },
    {
      id: 123,
      username: 'loser',
      sum_score: 2,
    },
  ],
}
