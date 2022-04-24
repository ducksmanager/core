<template>
  <div>
    <h3>Rounds</h3>
    <b-container>
      <b-row class="justify-content-center">
        <RoundResult
          v-for="round in scoresWithPersonUrls"
          :key="`round-${round.round_number}`"
          :round="round"
        />
      </b-row>
    </b-container>
    <h3 class="mt-3">Scores</h3>
    <b-table striped dark :items="playersWithScoresAndTotalScore" class="align-items-center">
      <template #head(playerId)="">&nbsp;</template>
      <template #head(totalScore)="">&nbsp;</template>
      <template #head()="{ column }">
        <b-img
          :src="imageUrl(scores[column.replace('round', '') - 1])"
          style="max-height: 100px; max-width: 100%"
        />
      </template>
      <template #thead-top>
        <tr>
          <th>{{ t('Player') }}</th>
          <th
            v-for="(round, index) in scoresWithPersonUrls"
            :key="`column-${index}`"
            class="text-nowrap"
          >
            <div>Round {{ round.round_number }}</div>
            <div class="font-weight-normal">{{ round.personfullname }}</div>
          </th>
          <th>{{ t('Total score') }}</th>
        </tr>
      </template>
      <template #cell(playerId)="{ value: playerId, index }">
        <player-info :username="playerNames[playerId]" :top-player="index === 0" />
      </template>
      <template #cell(totalScore)="{ value: totalScore }">
        <div>{{ totalScore }} points</div>
      </template>
      <template #cell()="{ value: playerRoundScores }">
        <round-score
          v-for="score in playerRoundScores"
          :key="`round-${score.round_id}-player-${score.player_id}`"
          class="text-center"
          :players="players.map(({ player }) => player)"
          :score="score"
        />
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
import Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'
import { Author, RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'

interface GamePlayerWithFullPlayer extends Index.game_player {
  player: Index.player
}

export default defineComponent({
  name: 'GameScores',
  props: {
    scores: {
      type: Array as () => Array<RoundWithScoresAndAuthor>,
      required: true,
    },
    players: {
      type: Array as () => Array<GamePlayerWithFullPlayer>,
      required: true,
    },
    authors: {
      type: Array as () => Array<Author>,
      required: true,
    },
  },

  setup({ scores, players, authors }) {
    const { t } = useI18n()
    const playerIds = players.map(({ player_id: playerId }) => playerId)

    const playerNames = players.reduce(
      (acc, { player }) => ({ ...acc, [player.id]: player.username }),
      {}
    )

    const scoresWithPersonUrls = ref(
      scores.map((roundScore) => ({
        ...roundScore,
        ...authors.find(({ personcode }) => personcode === roundScore.personcode),
        personurl: `https://inducks.org/creators/photos/${roundScore.personcode}.jpg`,
      }))
    )

    const playersWithScores: {
      [key: number]: { [key: string]: { [key: string]: { [key: string]: number } } }
    } = playerIds.reduce(
      (acc, playerId) => ({
        ...acc,
        [playerId]: scoresWithPersonUrls.value.reduce(
          (acc2, { round_number: roundNumber, round_scores: roundScores }) => ({
            ...acc2,
            [`round${roundNumber}`]: roundScores
              .filter(({ player_id: scorePlayerId }) => scorePlayerId === playerId)
              .reduce(
                (acc3, { score_type_name: scoreTypeName, score, speed_bonus: speedBonus }) => ({
                  ...acc3,
                  [scoreTypeName]: { score, speedBonus },
                }),
                {}
              ),
          }),
          {}
        ),
      }),
      {}
    )

    const playersWithScoresAndTotalScore = playerIds
      .map((playerId) => ({
        playerId,
        ...playersWithScores[playerId],
        totalScore: Object.values(playersWithScores[playerId]).reduce(
          (accTotalScore: number, roundScores) =>
            accTotalScore +
            Object.values(roundScores || {}).reduce(
              (accTotalRoundScore: number, { score: roundScore, speedBonus: roundSpeedBonus }) =>
                accTotalRoundScore + roundScore + (roundSpeedBonus || 0),
              0
            ),
          0
        ),
      }))
      .sort((player1WithScores, player2WithScores) =>
        player1WithScores.totalScore < player2WithScores.totalScore ? 1 : -1
      )
      .map((playerWithScores, idx) => {
        return {
          ...playerWithScores,
          _rowVariant: idx === 0 ? 'success' : '',
        }
      })

    return {
      t,
      scoresWithPersonUrls,
      playerNames,
      playersWithScoresAndTotalScore,
      imageUrl: ({ sitecode_url: url }: RoundWithScoresAndAuthor) =>
        `${process.env.CLOUDINARY_URL_ROOT}/${url}`,
    }
  },
})
</script>

<style scoped lang="scss">
::v-deep tr {
  height: 100px;

  td {
    text-align: center;
    vertical-align: middle;
  }

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
