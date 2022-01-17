import GameScores from '~/components/GameScores'

export default {
  title: 'GameScores',
}

const Template = (args) => ({
  components: { GameScores },
  setup() {
    return { args }
  },
  template: '<GameScores v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  scores: [
    {
      personcode: 'DR',
      personnationality: 'us',
      personfullname: 'Don Rosa',
      round_number: 0,
      sitecode_url: 'thumbnails3/webusers/2010/08/fr_jm_1473p20_001.jpg',
      round_scores: [
        {
          player_id: 1,
          score_type_name: 'Correct author',
          score: 10,
        },
      ],
    },
    {
      personcode: 'CB',
      personnationality: 'us',
      personfullname: 'Carl Barks',
      round_number: 1,
      sitecode_url: 'thumbnails3/webusers/2011/04/gr_mm_2288p005_001.jpg',
      round_scores: [
        {
          player_id: 1,
          score_type_name: 'Correct author',
          score: 10,
        },
        {
          player_id: 2,
          score_type_name: 'Correct author',
          score: 10,
        },
      ],
    },
    {
      personcode: 'RS',
      personnationality: 'it',
      personfullname: 'Romano Scarpa',
      round_number: 2,
      round_scores: [],
    },
  ],
}
