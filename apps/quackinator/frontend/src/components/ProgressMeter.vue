<script setup lang="ts">
import { computed } from "vue";

import {
  candidatesLeft,
  formatCount,
  formatPercent,
  roughCount,
} from "~quackinator/format";

/**
 * The bar tracks confidence in the leading story, not how far the search has
 * narrowed. Spread (`storyEntropyBits`) is shown alongside it as context — over
 * stories, never over storyversions — because it is not monotone: ruling out a
 * concentrated group and leaving a diffuse one
 * raises it even as the leading guess improves. Presenting that as progress made
 * the app look like it was going backwards on perfectly good answers.
 */
const props = defineProps<{
  storyEntropyBits: number;
  startingBits: number;
  progress: number;
  confidence: number;
  questionsAsked: number;
}>();

const spread = computed(() => candidatesLeft(props.storyEntropyBits));
const total = computed(() => candidatesLeft(props.startingBits));
</script>

<template>
  <div class="meter">
    <div class="labels">
      <span v-if="questionsAsked === 0">
        Narrowing down <strong>{{ formatCount(total) }}</strong> stories
      </span>
      <span v-else>
        <strong>{{ formatPercent(confidence) }}</strong> sure of the leading
        story
      </span>
      <span class="muted">
        {{ questionsAsked }}
        {{ questionsAsked === 1 ? "question" : "questions" }}
        <template v-if="questionsAsked > 0">
          · spread across {{ roughCount(spread) }}
          {{ spread === 1 ? "story" : "stories" }}
        </template>
      </span>
    </div>
    <div
      class="track"
      role="progressbar"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Confidence in the leading story"
    >
      <div class="fill" :style="{ width: `${progress * 100}%` }" />
    </div>
  </div>
</template>

<style scoped>
.meter {
  display: grid;
  gap: 0.4rem;
}

.labels {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.88rem;
}

.muted {
  color: var(--muted);
}

.track {
  height: 6px;
  background: var(--surface-alt);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}
</style>
