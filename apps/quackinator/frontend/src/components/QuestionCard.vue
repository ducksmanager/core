<script setup lang="ts">
import { computed } from "vue";

import type { Question } from "~quackinator/types";

const props = defineProps<{
  question: Question;
  busy: boolean;
  index: number;
}>();

const emit = defineEmits<{ answer: [option: number | null] }>();

/**
 * Yes/No questions get two wide buttons; a condensed page-count or language
 * question gets a grid. The reader is likely holding the magazine in one hand,
 * so targets stay large either way.
 */
const layout = computed(() =>
  props.question.options.length <= 2 ? "binary" : "grid",
);
</script>

<template>
  <section class="card" :aria-busy="busy">
    <p class="index">Question {{ index }}</p>

    <div class="ask">
      <h2 class="prompt">{{ question.prompt }}</h2>
      <!-- A character question is a question about a face, and the name is the
           part of it the reader may not have: theirs is a translation that
           renamed him, or they know the inventor with the light bulb and not
           the words "Gyro Gearloose". Inducks has the page that settles it.
           Opened in a new tab, always — losing the session to a lookup would
           cost the reader every answer they have given. -->
      <p v-if="question.inducks_url" class="lookup">
        Not sure who that is?
        <a
          :href="question.inducks_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Look them up on Inducks ↗
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
        {{ label }}
      </button>
    </div>

    <button
      type="button"
      class="unsure"
      :disabled="busy"
      @click="emit('answer', null)"
    >
      I can't tell
    </button>
    <p class="hint">
      Answer by looking at the pages in front of you. Skipping costs nothing — a
      question you can't answer is simply never asked again.
    </p>
  </section>
</template>

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
