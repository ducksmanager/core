<template>
  <div>
    <h3>Rounds</h3>
    <b-container>
      <b-row>
        <b-col
          v-for="round in scoresWithPersonUrls"
          :key="`round-${round.round_number}`"
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
              'background-image': `url('${round.personurl}')`,
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
import Vue from 'vue'

const cloudinaryUrlRoot =
  'https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/'

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
  },

  setup({ scores, players }) {
    const playerIds = players.map(({ player_id: playerId }) => playerId)

    const playerNames = players.reduce(
      (acc, { players }) => ({ ...acc, [players.id]: players.username }),
      {}
    )

    const scoresWithPersonUrls = ref(
      scores.map((roundScore) => ({
        ...roundScore,
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
      setDefaultAuthorUrl: (idx) => {
        Vue.set(scoresWithPersonUrls.value, idx, {
          ...scoresWithPersonUrls.value[idx],
          personurl:
            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Interrogation_mark_with_material_shadows.jpg',
        })
      },
      imageUrl: ({ entryurl_url: entryUrl }) =>
        `${cloudinaryUrlRoot}/${entryUrl}`,
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
    background-color: rgba(127, 127, 127, 0.85);
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
