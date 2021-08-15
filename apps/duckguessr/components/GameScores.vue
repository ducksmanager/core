<template>
  <div>
    <h3>Rounds</h3>
    <b-container class="bv-example-row">
      <b-row>
        <b-col
          v-for="round in scores.slice(0, scores.length - 1)"
          :key="`round${round.round_number}`"
          align-self="center"
          cols="3"
          class="round-card"
          :style="{
            'background-image': `url('${imageUrl(round)}')`,
          }"
        >
          <div
            class="author-banner mx-auto"
            :style="{
              'background-image': `url('https://inducks.org/creators/photos/${round.personcode}.jpg')`,
            }"
          >
            <flag :country="round.personnationality" />&nbsp;{{
              round.personfullname
            }}
          </div>
        </b-col>
      </b-row>
    </b-container>
    <h3 class="mt-3">Scores</h3>
    <b-table striped :items="playersWithScores">
      <template #head(playerName)="">Player name</template>
      <template #head(totalScore)="">Total score</template>
      <template #head()="{ column }">
        <b-img
          :src="imageUrl(scores[column.replace('round', '')])"
          class="w-100"
        />
        <div class="text-nowrap">
          {{ column.replace('round', 'Round ') }}
        </div></template
      >
      <template #cell(playerName)="{ value: playerName }">
        {{ playerName }}
      </template>
      <template #cell(totalScore)="{ value: totalScore }">
        {{ totalScore }}
      </template>
      <template #cell()="{ value }">
        <round-scores :scores="value" />
      </template>
    </b-table>
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

const cloudinaryUrlRoot =
  'https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/'

export default defineComponent({
  name: 'GameScores',
  props: {
    scores: {
      type: Array,
      required: true,
    },
  },

  setup({ scores }) {
    const playerIds = [
      ...new Set(
        scores
          .map(({ round_scores: roundScores }) =>
            roundScores.map(({ player_id: playerId }) => playerId)
          )
          .flat()
      ),
    ]
    return {
      playersWithScores: playerIds.map((playerId) => {
        const playerScores = scores.reduce(
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
      fields: [
        { key: 'playerName', label: 'Player name' },
        ...scores.reduce(
          (acc, { round_number: roundNumber }) => [
            ...acc,
            {
              key: `round${roundNumber}`,
            },
          ],
          []
        ),
        { key: 'totalScore', label: 'Total' },
      ],
      imageUrl: ({ entryurl_url: entryUrl }) =>
        `${cloudinaryUrlRoot}/${entryUrl}`,
    }
  },
})
</script>

<style scoped lang="scss">
.round-card {
  display: flex;
  align-items: flex-end;
  height: 200px;
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center;

  .author-banner {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    bottom: 0;
    right: 0;
    padding: 5px 0 0 60px;
    background-color: rgba(230, 230, 230, 0.9);
    background-size: 50px auto;
    background-repeat: no-repeat;
    text-align: center;

    .author-image {
      width: 40px;
      height: 40px;
      background-size: cover;
      border-radius: 25px;
      margin: 0 20px;
    }
  }
}
</style>
