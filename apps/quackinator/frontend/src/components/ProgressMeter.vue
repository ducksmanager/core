<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between gap-2 small mb-1">
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
      <span class="text-body-secondary">
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
    <b-progress
      :value="progress * 100"
      :max="100"
      height="6px"
      :aria-label="
        cover
          ? t('Confidence in the leading cover')
          : t('Confidence in the leading story')
      "
    />
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
