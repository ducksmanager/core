<template>
  <b-row>
    <b-col cols="5" align-self="center">
      <b-img center :src="url" />
    </b-col>
    <b-col cols="5" class="h-100">
      <b-row align-v="center" style="height: 50px">
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
    <b-col cols="2" class="border vh-100 overflow-auto">
      <h3>Round {{ currentRoundNumber }}</h3>
      <template v-for="score in currentRoundScores">
        <b-alert
          :key="`score-${score.player_id}`"
          show
          :variant="scoreToVariant(score)"
          class="d-flex flex-row p-1 align-items-center justify-content-between"
        >
          <user-info :username="getUsername(score.player_id)" />
          <div class="text-center">{{ score.score_type_name }}</div>
        </b-alert>
      </template>
    </b-col>
  </b-row>
</template>
<script lang="ts" setup>
import Index from '@prisma/client'
import AuthorCard from '~/components/AuthorCard.vue'
import { useScoreToVariant } from '~/composables/use-score-to-variant'
import { Author } from '~/types/roundWithScoresAndAuthor'

defineEmits(['select-author'])

const { players } = defineProps<{
  availableTime: number
  currentRoundNumber: number
  currentRoundScores: Index.round_score[]
  authors: Author[]
  players: Index.player[]
  previousPersoncodes: string[]
  remainingTime: number
  url: string
}>()

const getUsername = (playerId: number) => {
  return players.find(({ id }) => id === playerId)?.username || '?'
}

const scoreToVariant = useScoreToVariant
</script>
<style lang="scss">
#author-list {
  height: calc(100vh - 50px);
}
</style>
