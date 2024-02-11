<template>
  <b-row class="align-items-center m-0 flex-grow-1">
    <b-col cols="12" class="text-center d-md-none">
      <progress-bar
        :available-time="availableTime"
        :remaining-time="remainingTime"
      />
    </b-col>
    <b-col
      id="image-to-guess"
      cols="12"
      md="5"
      class="d-flex p-2 align-items-center"
    >
      <b-img center :src="url" />
    </b-col>
    <b-col id="author-list-wrapper" cols="12" md="5">
      <b-row align-v="center" style="height: 50px" class="d-none d-md-block">
        <b-col class="text-center">
          <progress-bar
            :available-time="availableTime"
            :remaining-time="hasEverybodyGuessed ? 0 : remainingTime"
          />
        </b-col>
      </b-row>
      <b-row id="author-list">
        <author-card
          v-for="(author, idx) in authors"
          :key="`author-${idx}`"
          :author="author"
          :enabled="!previousPersoncodes.includes(author.personcode)"
          :selectable="!previousPersoncodes.includes(author.personcode)"
          @select="$emit('select-author', $event)"
        />
      </b-row>
    </b-col>
    <b-col id="round-scores" cols="2" class="d-none d-md-block px-1">
      <div class="m-1 p-1 border overflow-auto">
        <h3>Round {{ currentRound.roundNumber }}</h3>
        <round-score
          v-for="score in roundScoresAllPlayers"
          :key="`score-${score.playerId}`"
          in-game
          :players="players"
          :score="score"
          :round="currentRound"
          :round-duration="roundDuration"
        />
      </div>
    </b-col>
  </b-row>
</template>
<script lang="ts" setup>
import {
  Author,
  OngoingRoundScore,
  RoundWithScoresAndAuthor,
} from "~duckguessr-types/roundWithScoresAndAuthor";
import { getUrl } from "~/composables/url";
import { player } from "~duckguessr-prisma-client";

defineEmits<{
  (e: "select-author", personcode: string): void;
}>();

const { currentRound, players, availableTime, remainingTime } =
  toRefs(
    defineProps<{
      currentRound: RoundWithScoresAndAuthor;
      hasEverybodyGuessed: boolean;
      availableTime: number;
      authors: Author[];
      players: player[];
      previousPersoncodes: string[];
      remainingTime: number;
    }>(),
  );

const url = computed(() => getUrl(currentRound.value.sitecodeUrl));

const roundScoresAllPlayers = computed(() =>
  players.value
    .map(
      (player) =>
        currentRound.value.roundScores.find(
          ({ playerId }) => playerId === player.id,
        ) ||
        ({
          timeSpentGuessing: 1000 * (availableTime.value - remainingTime.value),
          playerId: player.id,
          roundId: currentRound.value.id,
          speedBonus: 0,
        } as OngoingRoundScore),
    )
    // Correct scores first, then ongoing players, then wrong scores
    .sort(
      (
        { score: score1, speedBonus: speedBonus1 },
        { score: score2, speedBonus: speedBonus2 },
      ) =>
        score1 === 0
          ? 1
          : score2 === 0
            ? -1
            : (score1 || 0) + (speedBonus1 || 0) >
                (score2 || 0) + (speedBonus2 || 0)
              ? -1
              : 1,
    ),
);

const roundDuration = ref(
  new Date(currentRound.value.finishedAt!).getTime() -
    new Date(currentRound.value.startedAt!).getTime(),
);
</script>
<style lang="scss">
#image-to-guess {
  @media (max-width: 992px) {
    height: calc(50% - 15px);
  }

  img {
    max-width: 100%;
    max-height: 100%;
  }
}
#author-list-wrapper {
  height: 100%;
  @media (max-width: 992px) {
    height: calc(50% - 15px);
  }
}

#author-list {
  height: calc(100% - 50px);
  @media (max-width: 992px) {
    height: 100%;
  }

  .author-image {
    height: 100%;
  }
}

#round-scores {
  @media (min-width: 992px) {
    height: 100%;
  }
}

.progress {
  color: black;
}

.border {
  height: calc(100% - 10px);
}
</style>
