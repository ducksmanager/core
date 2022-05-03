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
          <progress-bar :available-time="availableTime" :remaining-time="remainingTime" />
        </b-col>
      </b-row>
      <b-row id="author-list">
        <author-card
          v-for="(author, idx) in authors"
          :key="`author-${idx}`"
          :author="author"
          :selectable="!previousPersoncodes.includes(author.personcode)"
          @select="$emit('select-author', $event)"
        />
      </b-row>
    </b-col>
    <b-col id="round-scores" cols="2" class="d-none d-md-block">
      <div class="m-1 p-1 border overflow-auto">
        <h3>Round {{ currentRound.round_number }}</h3>
        <round-score
          v-for="score in roundScoresAllPlayers"
          :key="`score-${score.player_id}`"
          in-game
          :players="players"
          :score="score"
        />
      </div>
    </b-col>
  </b-row>
</template>
<script lang="ts" setup>
import Index from '@prisma/client'
import { computed } from '@nuxtjs/composition-api'
import AuthorCard from '~/components/AuthorCard.vue'
import {
  Author,
  OngoingRoundScore,
  RoundWithScoresAndAuthor,
} from '~/types/roundWithScoresAndAuthor'

defineEmits(['select-author'])

const props = defineProps<{
  currentRound: RoundWithScoresAndAuthor
  availableTime: number
  authors: Author[]
  players: Index.player[]
  previousPersoncodes: string[]
  remainingTime: number
}>()

const url = computed(() => `${process.env.CLOUDINARY_URL_ROOT}${props.currentRound.sitecode_url}`)

const roundScoresAllPlayers = computed(() =>
  props.players
    .map(
      (player) =>
        props.currentRound.round_scores.find(({ player_id }) => player_id === player.id) ||
        ({
          percentage_time_spent_guessing: props.remainingTime * (100 / props.availableTime),
          player_id: player.id,
          round_id: props.currentRound.id,
        } as OngoingRoundScore)
    )
    // Correct scores first, then ongoing players, then wrong scores
    .sort(({ score: score1 }, { score: score2 }) =>
      score1 === 0 ? 1 : score2 === 0 ? -1 : (score1 || 0) > (score2 || 0) ? -1 : 1
    )
)
</script>
<style lang="scss">
#image-to-guess {
  @media (max-width: 767px) {
    height: calc(50% - 15px);
  }

  img {
    max-height: 100%;
  }
}
#author-list-wrapper {
  height: 100%;
  @media (max-width: 767px) {
    height: calc(50% - 15px);
  }
}

#author-list {
  height: calc(100% - 50px);
  @media (max-width: 767px) {
    height: 100%;
  }

  .author-image {
    height: 100%;
  }
}

#round-scores {
  @media (min-width: 767px) {
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
