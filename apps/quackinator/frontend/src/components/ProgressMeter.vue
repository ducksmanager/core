<template>
  <div class="meter">
    <div class="labels">
      <i18n-t
        v-if="questionsAsked === 0"
        :keypath="
          cover
            ? 'Narrowing down {count} covers'
            : 'Narrowing down {count} stories'
        "
        tag="span"
        scope="parent"
      >
        <template #count>
          <strong>{{ formatCount(total, locale) }}</strong>
        </template>
      </i18n-t>
      <i18n-t
        v-else
        :keypath="
          cover
            ? '{percent} sure of the leading cover'
            : '{percent} sure of the leading story'
        "
        tag="span"
        scope="parent"
      >
        <template #percent>
          <strong>{{ formatPercent(confidence, locale) }}</strong>
        </template>
      </i18n-t>
      <span class="muted">
        {{
          t(
            "{count} question | {count} questions",
            { count: questionsAsked },
            questionsAsked,
          )
        }}
        <template v-if="questionsAsked > 0">
          ·
          {{
            cover
              ? t(
                  "spread across {count} cover | spread across {count} covers",
                  { count: roughCount(spread, locale) },
                  spread,
                )
              : t(
                  "spread across {count} story | spread across {count} stories",
                  { count: roughCount(spread, locale) },
                  spread,
                )
          }}
        </template>
      </span>
    </div>
    <div
      class="track"
      role="progressbar"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="
        cover
          ? t('Confidence in the leading cover')
          : t('Confidence in the leading story')
      "
    >
      <div class="fill" :style="{ width: `${progress * 100}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { I18nT } from "vue-i18n";

import {
  candidatesLeft,
  formatCount,
  formatPercent,
  roughCount,
} from "~quackinator/format";
import { useQuackinatorI18n } from "~quackinator/i18n";

// The bar tracks confidence; entropy is shown only as context because it isn't monotone.
const {
  storyEntropyBits,
  startingBits,
  cover = false,
} = defineProps<{
  storyEntropyBits: number;
  startingBits: number;
  progress: number;
  confidence: number;
  questionsAsked: number;
  cover?: boolean;
}>();

const { t, locale } = useQuackinatorI18n();

const spread = computed(() => candidatesLeft(storyEntropyBits));
const total = computed(() => candidatesLeft(startingBits));
</script>

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
