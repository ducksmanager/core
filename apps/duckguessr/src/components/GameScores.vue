<template>
  <div class="text-center">
    <h3>{{ t("Game summary") }}</h3>
    <b-container>
      <b-row class="justify-content-center">
        <RoundResult
          v-for="round in roundsWithPersonUrls"
          :key="`round-${round.roundNumber}`"
          :round="round"
        />
      </b-row>
    </b-container>
    <b-container>
      <b-row class="flex-column align-items-center">
        <h3 class="my-3">
          {{ getShownUsername(winningPlayer.username) }}
          {{ t("won the match!") }}
        </h3>
        <template v-if="currentUserHasParticipated">
          <div>
            {{ t("You have found the correct answer in")
            }}<b>
              {{ currentUserWonRounds.length }} {{ t("rounds out of") }}
              {{ roundsWithPersonUrls.length }}</b
            >.
          </div>
          <div>
            {{ t("You were the fastest in")
            }}<b>
              {{ currentUserWonFastestRounds.length }} {{ t("rounds out of") }}
              {{ roundsWithPersonUrls.length }}</b
            >.
          </div>
        </template>
        <div v-else>{{ t("You haven't participated to this game.") }}</div>
      </b-row>
    </b-container>
    <template v-if="currentUserHasParticipated">
      <h3>{{ t("Medals") }}</h3>
      <medal-list
        v-if="!isAnonymous && hasUserStats"
        :dataset="game.dataset"
        with-details
        :cols="12"
      />
    </template>
    <h3 class="mt-3">{{ t("Scores") }}</h3>
    <b-table
      striped
      dark
      :items="playersWithScoresAndTotalScore"
      class="align-items-center"
    >
      <template #head(playerId)="">&nbsp;</template>
      <template #head(totalScore)="">&nbsp;</template>
      <template #head()="{ field }">
        <b-img
          :src="imageUrl(columnToRound(field))"
          style="max-height: 100px; max-width: 100%"
        />
      </template>
      <template #thead-top>
        <tr>
          <th>{{ t("Player") }}</th>
          <th
            v-for="(round, index) in roundsWithPersonUrls"
            :key="`column-${index}`"
            class="text-nowrap"
          >
            <div>Round {{ round.roundNumber }}</div>
            <div class="font-weight-normal">{{ round.fullname }}</div>
          </th>
          <th>{{ t("Total score") }}</th>
        </tr>
      </template>
      <template #cell(playerId)="{ value: playerId, index }">
        <b-card :style="{ width: '12rem' }">
          <player-info
            :username="players[playerId as number].username"
            :avatar="players[playerId as number].avatar"
            :top-player="index === 0"
            no-right-panel
          />
        </b-card>
      </template>
      <template #cell(totalScore)="{ value: totalScore }">
        <div>{{ totalScore }} points</div>
      </template>
      <template #cell()="{ value: playerRoundScores }: { value: unknown }">
        <round-score
          v-for="score in (playerRoundScores as roundScore[])"
          :key="`round-${score.roundId}-player-${score.playerId}`"
          class="text-center"
          :players="game.gamePlayers.map(({ player }) => player)"
          :score="score"
        />
      </template>
    </b-table>
  </div>
</template>

<script lang="ts" setup>
import { RoundWithScoresAndAuthor } from "~types/roundWithScoresAndAuthor";
import { getDuckguessrId, getShownUsername } from "~/composables/user";

import { userStore } from "~/stores/user";
import { GameFullNoPersoncode } from "~types/game";
import { getUrl } from "~/composables/url";
import { ColorVariant } from "bootstrap-vue-next";
import { player, roundScore } from "~duckguessr-api/types/prisma-client";

const { game } = toRefs(
  defineProps<{
    game: GameFullNoPersoncode;
  }>()
);

const duckguessrId = getDuckguessrId();
const isAnonymous = computed(() => userStore().isAnonymous);

const playerIds = game.value.gamePlayers.map(({ playerId }) => playerId);
const players = game.value.gamePlayers.reduce(
  (acc, { player }) => ({ ...acc, [player.id]: player }),
  {} as Record<number, player>
);
const roundsWithPersonUrls = ref(
  game.value.rounds.map((roundScore) => ({
    ...roundScore,
    ...game.value.authors.find(
      ({ personcode }) => personcode === roundScore.personcode
    ),
    personurl: `https://inducks.org/creators/photos/${roundScore.personcode}.jpg`,
  }))
);
const playersWithScores: Record<
  number,
  Record<string, Record<string, Record<string, number>>>
> = playerIds.reduce(
  (acc, playerId) => ({
    ...acc,
    [playerId]: roundsWithPersonUrls.value.reduce(
      (acc2, { roundNumber, roundScores }) => ({
        ...acc2,
        [`round${roundNumber}`]: roundScores
          .filter(({ playerId: scorePlayerId }) => scorePlayerId === playerId)
          .reduce(
            (acc3, { scoreTypeName, score, speedBonus }) => ({
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
);
const playersWithScoresAndTotalScore = playerIds
  .map((playerId) => ({
    playerId,
    ...playersWithScores[playerId],
    totalScore: Object.values(playersWithScores[playerId]).reduce(
      (accTotalScore: number, roundScores) =>
        accTotalScore +
        Object.values(roundScores || {}).reduce(
          (
            accTotalRoundScore: number,
            { score: roundScore, speedBonus: roundSpeedBonus }
          ) => accTotalRoundScore + roundScore + (roundSpeedBonus || 0),
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
    _rowVariant: (idx === 0 ? "success" : "") as ColorVariant,
  }));

const currentUserHasParticipated = computed(() =>
  game.value.gamePlayers.map(({ playerId }) => playerId).includes(duckguessrId)
);

const currentUserScores = game.value.rounds.map(({ roundScores }) =>
  roundScores.find(({ playerId }) => playerId === duckguessrId)
);

const currentUserWonRounds = currentUserScores.filter(
  (roundScore) => roundScore?.scoreTypeName === "Correct author"
);

const winningPlayerScores = computed(() =>
  playersWithScoresAndTotalScore?.find(
    (player) => player._rowVariant === "success"
  )
);

const winningPlayer = computed(
  () =>
    game.value.gamePlayers.find(
      ({ playerId }) => playerId === winningPlayerScores.value?.playerId
    )!.player
);

const currentUserWonFastestRounds = currentUserWonRounds.filter(
  (roundScore) =>
    roundScore!.speedBonus ===
    Math.max(
      ...game.value.rounds
        .find((score) => score?.id === roundScore!.roundId)!
        .roundScores.map(
          (otherPlayerRoundScore) => otherPlayerRoundScore!.speedBonus || 0
        )
    )
);

const hasUserStats = computed(() => userStore().stats && userStore().gameStats);

watch(
  () => userStore().loginSocket && currentUserHasParticipated.value,
  (loggedInAndParticipated) => {
    if (loggedInAndParticipated) {
      userStore().loadStats();
      userStore().loadGameStats(
        game.value.id!,
        game.value.dataset.name,
        winningPlayer.value?.id === duckguessrId
      );
    }
  },
  { immediate: true }
);

const { t } = useI18n();
const imageUrl = ({ sitecodeUrl: url }: RoundWithScoresAndAuthor) =>
  getUrl(`/${url}`);
const columnToRound = (column: string) =>
  game.value.rounds[parseInt(column.replace("round", "")) - 1];
</script>

<style scoped lang="scss">
h3 {
  margin-top: 2rem;
}
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
.card {
  color: black;
}
</style>
