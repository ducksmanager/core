<template>
  <div>
    <h3>Rounds</h3>
    <b-container>
      <b-row>
        <RoundResult
          v-for="round in scoresWithPersonUrls"
          :key="`round-${round.round_number}`"
          :round="round"
        />
      </b-row>
    </b-container>
    <h3 class="mt-3">Scores</h3>
    <b-table striped dark :items="playersWithScores">
      <template #head(playerName)="">&nbsp;</template>
      <template #head(totalScore)="">&nbsp;</template>
      <template #head()="{ column }">
        <b-img
          :src="imageUrl(scores[column.replace('round', '') - 1])"
          style="max-height: 100px; max-width: 100%"
        />
      </template>
      <template #thead-top>
        <tr>
          <th>Player</th>
          <th
            v-for="(round, index) in scoresWithPersonUrls"
            :key="`column-${index}`"
            class="text-nowrap"
          >
            Round {{ round.round_number }}
          </th>
          <th>Total score</th>
        </tr>
      </template>
      <template #cell(playerName)="{ value: playerId }">
        <user-info :username="playerNames[playerId]" />
      </template>
      <template #cell(totalScore)="{ value: totalScore }">
        {{ totalScore }} points
      </template>
      <template #cell()="{ value }">
        <round-scores :scores="value" />
      </template>
    </b-table>
  </div>
</template>

<script>
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'GameScores',
  props: {
    scores: {
      type: Array,
      required: true,
    },
    players: {
      type: Array,
      required: true,
    },
    authors: {
      type: Array,
      required: true,
    },
  },

  setup({ scores, players, authors }) {
    const playerIds = players.map(({ player_id: playerId }) => playerId)

    const playerNames = players.reduce(
      (acc, { players }) => ({ ...acc, [players.id]: players.username }),
      {}
    )

    const scoresWithPersonUrls = ref(
      scores.map((roundScore) => ({
        ...roundScore,
        ...authors.find(
          ({ personcode }) => personcode === roundScore.personcode
        ),
        personurl: `https://inducks.org/creators/photos/${roundScore.personcode}.jpg`,
      }))
    )

    return {
      scoresWithPersonUrls,
      playerNames,
      playersWithScores: playerIds.map((playerId) => {
        const playerScores = scoresWithPersonUrls.value.reduce(
          (acc, { round_number: roundNumber, round_scores: roundScores }) => ({
            ...acc,
            [`round${roundNumber}`]: roundScores
              .filter(
                ({ player_id: scorePlayerId }) => scorePlayerId === playerId
              )
              .reduce(
                (acc2, { score_type_name: scoreTypeName, score }) => ({
                  ...acc2,
                  [scoreTypeName]: score,
                }),
                {}
              ),
          }),
          {}
        )
        return {
          playerName: playerId,
          ...playerScores,
          totalScore: Object.values(playerScores).reduce(
            (accTotalScore, roundScores) =>
              accTotalScore +
              Object.values(roundScores).reduce(
                (accTotalRoundScore, roundScore) =>
                  accTotalRoundScore + roundScore,
                0
              ),
            0
          ),
        }
      }),
      imageUrl: ({ sitecode_url: url }) =>
        `${process.env.CLOUDINARY_URL_ROOT}/${url}`,
    }
  },
})
</script>

<style scoped lang="scss">
::v-deep tr {
  height: 100px;

  th {
    width: 11%;
    vertical-align: middle;
    text-align: center;
    img {
      max-height: 100px;
    }

    div {
      text-align: center;
    }
  }
}
</style>
