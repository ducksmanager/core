<template>
  <section class="card" :aria-busy="busy">
    <p class="index">{{ t("Question {index}", { index }) }}</p>

    <div class="ask">
      <h2 class="prompt">{{ tm(question.prompt_message) }}</h2>
      <p v-if="question.inducks_url" class="lookup">
        {{ t("Not sure who that is?") }}
        <a
          :href="question.inducks_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t("Look them up on Inducks ↗") }}
        </a>
      </p>
    </div>

    <div class="options" :class="layout">
      <button
        v-for="(label, i) in question.options"
        :key="label"
        type="button"
        class="option"
        :disabled="busy"
        @click="emit('answer', i)"
      >
        {{ tm(question.option_messages[i]!) }}
      </button>
    </div>

    <button
      type="button"
      class="unsure"
      :disabled="busy"
      @click="emit('answer', null)"
    >
      {{ t("I can't tell") }}
    </button>
    <p class="hint">
      {{
        t(
          "Answer by looking at the pages in front of you. Skipping won't mislead the search, but it still counts as one of your questions.",
        )
      }}
    </p>
  </section>
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
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.index {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ask {
  margin-bottom: 1.25rem;
}

.prompt {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.3;
}

.lookup {
  margin: 0.45rem 0 0;
  color: var(--muted);
  font-size: 0.84rem;
}

.lookup a {
  color: inherit;
  text-decoration-color: var(--border);
}

.lookup a:hover {
  color: var(--text);
}

.options {
  display: grid;
  gap: 0.6rem;
}

.options.binary {
  grid-template-columns: 1fr 1fr;
}

.options.grid {
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
}

.option {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-weight: 550;
  text-align: center;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.06s ease;
}

.option:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.option:active:not(:disabled) {
  transform: translateY(1px);
}

.unsure {
  margin-top: 1rem;
  background: none;
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.unsure:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--muted);
}

.hint {
  margin: 0.9rem 0 0;
  color: var(--muted);
  font-size: 0.84rem;
}
</style>
