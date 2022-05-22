import GameComponent from '~/components/GameComponent'

export default {
  title: 'GameComponent',
}

const Template = (args) => ({
  components: { GameComponent },
  setup() {
    return { args }
  },
  template: '<GameComponent v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  availableTime: 15,
  chosenAuthor: 'DR',
  currentRound: {
    round_number: 2,
    started_at: '2022-05-21T00:00:00',
    finished_at: '2022-05-21T00:01:00',
    round_scores: [
      {
        id: 100,
        player_id: 1,
        round_id: 10,
        score_type_name: 'Correct author',
        score: 100,
        speed_bonus: 10,
        time_spent_guessing: 20 * 1000,
      },
      {
        id: 101,
        player_id: 3,
        round_id: 10,
        score_type_name: 'Wrong author',
        score: 0,
        speed_bonus: 0,
        time_spent_guessing: 10 * 1000,
      },
    ],
    sitecode_url:
      'https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/thumbnails3/webusers/2008/09/us_zz1966b23x_001.jpg',
  },
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
  players: [
    {
      id: 1,
      username: 'brunoperel',
      ducksmanager_id: 117,
    },
    {
      id: 2,
      username: 'Wizyx',
      ducksmanager_id: 1,
    },
    {
      id: 3,
      username: 'remifanpicsou',
      ducksmanager_id: 3,
    },
  ],
  previousPersoncodes: ['CB', 'DR'],
  remainingTime: 5,
}
