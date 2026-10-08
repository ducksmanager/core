<template>
  <b-card :aria-busy="busy">
    <p class="small text-uppercase fw-semibold text-body-secondary mb-1">
      {{ t("Question {index}", { index }) }}
    </p>
    <h2 class="h4 mb-0">{{ tm(question.prompt_message) }}</h2>
    <p v-if="question.inducks_url" class="small text-body-secondary mt-2 mb-0">
      {{ t("Not sure who that is?") }}
      <a
        :href="question.inducks_url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-secondary"
      >
        {{ t("Look them up on Inducks ↗") }}
      </a>
    </p>

    <div class="options mt-3" :class="layout">
      <b-button
        v-for="(label, i) in question.options"
        :key="label"
        variant="outline-primary"
        :disabled="busy"
        @click="emit('answer', i)"
      >
        {{ tm(question.option_messages[i]!) }}
      </b-button>
    </div>

    <b-button
      variant="outline-secondary"
      size="sm"
      class="mt-3"
      :disabled="busy"
      @click="emit('answer', null)"
    >
      {{ t("I can't tell") }}
    </b-button>
    <p class="small text-body-secondary mt-3 mb-0">
      {{
        t(
          "Answer by looking at the pages in front of you. Skipping won't mislead the search, but it still counts as one of your questions.",
        )
      }}
    </p>
  </b-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useQuackinatorI18n } from "~quackinator/i18n";
import type { Question } from "~quackinator/types";

const { question, busy, index } = defineProps<{
  question: Question;
  busy: boolean;
  index: number;
}>();

const emit = defineEmits<{ (e: "answer", option: number | null): void }>();

const { t, tm } = useQuackinatorI18n();

const layout = computed(() =>
  question.options.length <= 2 ? "binary" : "grid",
);
</script>

<style scoped>
.options {
  display: grid;
  gap: 0.5rem;
}

.options.binary {
  grid-template-columns: 1fr 1fr;
}

.options.grid {
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
}
</style>
