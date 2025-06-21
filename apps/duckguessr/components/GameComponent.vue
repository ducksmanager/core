<template>
  <b-row class="align-items-center m-0 flex-grow-1">
    <b-col cols="12" class="text-center d-md-none">
      <progress-bar :available-time="availableTime" :remaining-time="remainingTime" />
    </b-col>
    <b-col id="image-to-guess" cols="12" md="5" class="d-flex p-2 align-items-center">
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
        <h3>Round {{ currentRound.round_number }}</h3>
        <round-score
          v-for="score in roundScoresAllPlayers"
          :key="`score-${score.player_id}`"
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
import Index from '@prisma/client'
import { computed, ref } from '@nuxtjs/composition-api'
import {
  Author,
  OngoingRoundScore,
  RoundWithScoresAndAuthor,
} from '~/types/roundWithScoresAndAuthor'
import { getUrl } from '~/composables/url'

defineEmits(['select-author'])

const props = defineProps<{
  currentRound: RoundWithScoresAndAuthor
  hasEverybodyGuessed: boolean
  availableTime: number
  authors: Author[]
  players: Index.player[]
  previousPersoncodes: string[]
  remainingTime: number
}>()

const url = computed(() => getUrl(props.currentRound.sitecode_url))

const roundScoresAllPlayers = computed(() =>
  props.players
    .map(
      (player) =>
        props.currentRound.round_scores.find(({ player_id }) => player_id === player.id) ||
        ({
          time_spent_guessing: 1000 * (props.availableTime - props.remainingTime),
          player_id: player.id,
          round_id: props.currentRound.id,
          speed_bonus: 0,
        } as OngoingRoundScore)
    )
    // Correct scores first, then ongoing players, then wrong scores
    .sort(
      ({ score: score1, speed_bonus: speedBonus1 }, { score: score2, speed_bonus: speedBonus2 }) =>
        score1 === 0
          ? 1
          : score2 === 0
          ? -1
          : (score1 || 0) + (speedBonus1 || 0) > (score2 || 0) + (speedBonus2 || 0)
          ? -1
          : 1
    )
)

const roundDuration = ref(
  new Date(props.currentRound.finished_at!).getTime() -
    new Date(props.currentRound.started_at!).getTime()
)
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
