import Game from '~/components/Game'

export default {
  title: 'Game',
}

const Template = (args) => ({
  components: { Game },
  setup() {
    return { args }
  },
  template: '<Game v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  availableTime: 15,
  chosenAuthor: 'DR',
  currentRound: {
    round_number: 2,
    round_scores: [
      {
        id: 100,
        player_id: 1,
        round_id: 10,
        score_type_name: 'Correct author',
        score: 100,
        speed_bonus: 10,
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
  ],
  previousPersoncodes: ['CB', 'DR'],
  remainingTime: 5,
}
