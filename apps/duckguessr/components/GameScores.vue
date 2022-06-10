<template>
  <div>
    <h3>{{ t('Game summary') }}</h3>
    <b-container>
      <b-row class="justify-content-center">
        <RoundResult
          v-for="round in roundsWithPersonUrls"
          :key="`round-${round.round_number}`"
          :round="round"
        />
      </b-row>
    </b-container>
    <b-container>
      <b-row class="flex-column align-items-center">
        <template v-if="currentUserHasParticipated">
          <h3 class="mb-3">
            {{
              players.find(({ player_id: playerId }) => playerId === winningPlayer.playerId).player
                .username
            }}
            {{ t('won the match!') }}
          </h3>
          <div>
            {{ t('You have found the correct answer in')
            }}<b>
              {{ currentUserWonRounds.length }} {{ t('rounds out of') }}
              {{ roundsWithPersonUrls.length }}</b
            >.
          </div>
          <div>
            {{ t('You were the fastest in')
            }}<b>
              {{ currentUserWonFastestRounds.length }} {{ t('rounds out of') }}
              {{ roundsWithPersonUrls.length }}</b
            >.
          </div>
        </template>
        <div v-else>{{ t("Vous n'avez pas participé à cette partie.") }}</div>
      </b-row>
    </b-container>
    <template v-if="currentUserHasParticipated">
      <h3>{{ t('Medals') }}</h3>
      <medal-list v-if="currentUserFastRounds" :stats="currentUserFastRounds" />
      <b-row v-else class="justify-content-center">
        {{ t("You haven't won medals during this game.") }}
      </b-row>
    </template>
    <h3 class="mt-3">Scores</h3>
    <b-table striped dark :items="playersWithScoresAndTotalScore" class="align-items-center">
      <template #head(playerId)="">&nbsp;</template>
      <template #head(totalScore)="">&nbsp;</template>
      <template #head()="{ column }">
        <b-img :src="imageUrl(columnToRound(column))" style="max-height: 100px; max-width: 100%" />
      </template>
      <template #thead-top>
        <tr>
          <th>{{ t('Player') }}</th>
          <th
            v-for="(round, index) in roundsWithPersonUrls"
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

<script lang="ts" setup>
import { computed, ref } from '@nuxtjs/composition-api'
import Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'
import { io } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { Author, RoundWithScoresAndAuthor } from '~/types/roundWithScoresAndAuthor'
import { getDuckguessrId } from '@/composables/user'

interface GamePlayerWithFullPlayer extends Index.game_player {
  player: Index.player
}

const gameScoresProps = defineProps<{
  gameId: Number
  rounds: Array<RoundWithScoresAndAuthor>
  players: Array<GamePlayerWithFullPlayer>
  authors: Array<Author>
}>()

const duckguessrId = getDuckguessrId()
const playerIds = gameScoresProps.players.map(({ player_id: playerId }) => playerId)
const playerNames = gameScoresProps.players.reduce(
  (acc, { player }) => ({ ...acc, [player.id]: player.username }),
  {}
)
const roundsWithPersonUrls = ref(
  gameScoresProps.rounds.map((roundScore) => ({
    ...roundScore,
    ...gameScoresProps.authors.find(({ personcode }) => personcode === roundScore.personcode),
    personurl: `https://inducks.org/creators/photos/${roundScore.personcode}.jpg`,
  }))
)
const playersWithScores: {
  [key: number]: { [key: string]: { [key: string]: { [key: string]: number } } }
} = playerIds.reduce(
  (acc, playerId) => ({
    ...acc,
    [playerId]: roundsWithPersonUrls.value.reduce(
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
  .map((playerWithScores, idx) => ({
    ...playerWithScores,
    _rowVariant: idx === 0 ? 'success' : '',
  }))

const currentUserHasParticipated = gameScoresProps.players
  .map(({ player_id }) => player_id)
  .includes(duckguessrId)

const currentUserScores = gameScoresProps.rounds.map(({ round_scores }) =>
  round_scores.find(({ player_id }) => player_id === duckguessrId)
)

const currentUserWonRounds = currentUserScores.filter(
  (roundScore) => roundScore?.score_type_name === 'Correct author'
)

const winningPlayer = computed(() =>
  playersWithScoresAndTotalScore?.find((player) => player._rowVariant === 'success')
)

const currentUserWonFastestRounds = currentUserWonRounds.filter(
  (roundScore) =>
    roundScore!.speed_bonus ===
    Math.max(
      ...gameScoresProps.rounds
        .find((score) => score.id === roundScore!.round_id)!
        .round_scores.map((otherPlayerRoundScore) => otherPlayerRoundScore!.speed_bonus || 0)
    )
)

const currentUserFastRounds = ref(null as { [key: string]: number } | null)

if (currentUserHasParticipated) {
  io(`${process.env.SOCKET_URL}/login`, {
    auth: {
      cookie: useCookies().getAll(),
    },
  }).emit('getStats', gameScoresProps.gameId, (stats: { [key: string]: number }) => {
    currentUserFastRounds.value = stats
  })
}

const { t } = useI18n()
const imageUrl = ({ sitecode_url: url }: RoundWithScoresAndAuthor) =>
  `${process.env.CLOUDINARY_URL_ROOT}/${url}`
const columnToRound = (column: string) =>
  gameScoresProps.rounds[parseInt(column.replace('round', '')) - 1]
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
