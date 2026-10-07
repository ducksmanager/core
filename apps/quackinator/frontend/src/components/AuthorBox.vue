<template>
  <section class="card" :aria-busy="busy">
    <p class="index">{{ t("Before we start") }}</p>
    <h2 class="prompt">
      {{
        cover
          ? t("Does the cover name who drew it?")
          : t("Does the first page name who wrote or drew it?")
      }}
    </h2>
    <p class="hint">
      {{
        t(
          "Many printings don't credit anyone — if yours doesn't, skip this. When it is there, it narrows things down more than any question can.",
        )
      }}
    </p>

    <label class="field">
      <span class="sr-only">{{ t("Author or artist name") }}</span>
      <input
        v-model="query"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="
          cover
            ? t('Type a name from the cover…')
            : t('Type a name from the page…')
        "
        :disabled="busy"
      />
    </label>

    <ul v-if="matches.length" class="matches">
      <li v-for="match in matches" :key="match.creator">
        <button type="button" :disabled="busy" @click="emit('pick', match)">
          <span class="name">{{ match.name }}</span>
          <span v-if="match.matched !== match.name" class="alias">
            {{ t("printed as {name}", { name: match.matched }) }}
          </span>
          <span class="count">{{
            t(
              "{count} story | {count} stories",
              { count: match.stories.toLocaleString(locale) },
              match.stories,
            )
          }}</span>
        </button>
      </li>
    </ul>

    <p v-else-if="query.trim().length >= 2 && !searching" class="empty">
      {{ t("No one by that name in Inducks. Check the spelling, or skip.") }}
    </p>

    <button
      type="button"
      class="unsure"
      :disabled="busy"
      @click="emit('dismiss')"
    >
      {{ t("No names printed — start the questions") }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import { useQuackinatorI18n } from "~quackinator/i18n";
import type { CreatorMatch } from "~quackinator/types";

const { busy, cover = false } = defineProps<{
  busy: boolean;
  cover?: boolean;
}>();
const emit = defineEmits<{
  (
    e: "search",
    query: string,
    resolve: (matches: CreatorMatch[]) => void,
  ): void;
  (e: "pick", match: CreatorMatch): void;
  (e: "dismiss"): void;
}>();

const { t, locale } = useQuackinatorI18n();

const query = ref("");
const matches = ref<CreatorMatch[]>([]);
const searching = ref(false);
let seq = 0;

// Debounced; the sequence number drops responses that arrive out of order.
watch(query, (value) => {
  const text = value.trim();
  const mine = ++seq;
  if (text.length < 2) {
    matches.value = [];
    searching.value = false;
    return;
  }
  searching.value = true;
  window.setTimeout(() => {
    if (mine !== seq) return;
    emit("search", text, (found) => {
      if (mine !== seq) return;
      matches.value = found;
      searching.value = false;
    });
  }, 150);
});
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

.prompt {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  line-height: 1.3;
}

.hint {
  margin: 0 0 1.1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.field input {
  width: 100%;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font: inherit;
  color: inherit;
}

.field input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.matches {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.matches button {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  text-align: left;
}

.matches button:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.name {
  font-weight: 600;
}

.alias,
.count {
  color: var(--muted);
  font-size: 0.84rem;
}

.count {
  margin-left: auto;
}

.empty {
  margin: 0.75rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
