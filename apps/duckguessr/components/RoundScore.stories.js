import RoundScore from '~/components/RoundScore'

export default {
  title: 'RoundScore',
}

const Template = (args) => ({
  components: { RoundScore },
  setup() {
    return { args }
  },
  template: '<round-score v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  scoreTypeName: 'Score type 1',
  players: [
    {
      id: 1,
      username: 'Wizyx',
    },
  ],
  score: {
    player_id: 1,
    score: 10,
    speedBonus: 5,
    score_type_name: 'Correct author',
    time_spent_guessing: 2500,
  },
  roundDuration: 1000,
}
export const InGame = Template.bind({})
InGame.args = {
  inGame: true,
  scoreTypeName: 'Score type 1',
  players: [
    {
      id: 1,
      username: 'Wizyx',
    },
  ],
  score: {
    player_id: 1,
    score: 10,
    speedBonus: 5,
    score_type_name: 'Correct author',
    time_spent_guessing: 2500,
  },
  roundDuration: 10000,
}
export const InGameNotGuessedYet = Template.bind({})
InGameNotGuessedYet.args = {
  inGame: true,
  players: [
    {
      id: 1,
      username: 'Wizyx',
    },
  ],
  score: {
    player_id: 1,
    score: null,
    speedBonus: null,
    time_spent_guessing: 2500,
  },
  roundDuration: 10000,
}
export const InGameWrongAuthor = Template.bind({})
InGameWrongAuthor.args = {
  inGame: true,
  scoreTypeName: 'Score type 1',
  players: [
    {
      id: 1,
      username: 'Wizyx',
    },
  ],
  score: {
    player_id: 1,
    score: 0,
    speedBonus: 5,
    score_type_name: 'Wrong author',
    time_spent_guessing: 3000,
  },
  roundDuration: 10000,
}
