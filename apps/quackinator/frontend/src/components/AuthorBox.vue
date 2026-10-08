<template>
  <b-card :aria-busy="busy">
    <p class="small text-uppercase fw-semibold text-body-secondary mb-1">
      {{ t("Before we start") }}
    </p>
    <h2 class="h4">
      {{
        cover
          ? t("Does the cover name who drew it?")
          : t("Does the first page name who wrote or drew it?")
      }}
    </h2>
    <p class="small text-body-secondary">
      {{
        t(
          "Many printings don't credit anyone — if yours doesn't, skip this. When it is there, it narrows things down more than any question can.",
        )
      }}
    </p>

    <b-form-input
      v-model="query"
      autocomplete="off"
      spellcheck="false"
      :aria-label="t('Author or artist name')"
      :placeholder="
        cover
          ? t('Type a name from the cover…')
          : t('Type a name from the page…')
      "
      :disabled="busy"
    />

    <b-list-group v-if="matches.length" class="mt-2">
      <b-list-group-item
        v-for="match in matches"
        :key="match.creator"
        button
        :disabled="busy"
        class="d-flex flex-wrap align-items-baseline gap-2"
        @click="emit('pick', match)"
      >
        <span class="fw-semibold">{{ match.name }}</span>
        <span
          v-if="match.matched !== match.name"
          class="small text-body-secondary"
        >
          {{ t("printed as {name}", { name: match.matched }) }}
        </span>
        <span class="small text-body-secondary ms-auto">{{
          t(
            "{count} story | {count} stories",
            { count: match.stories.toLocaleString(locale) },
            match.stories,
          )
        }}</span>
      </b-list-group-item>
    </b-list-group>

    <p
      v-else-if="query.trim().length >= 2 && !searching"
      class="small text-body-secondary mt-2 mb-0"
    >
      {{ t("No one by that name in Inducks. Check the spelling, or skip.") }}
    </p>

    <b-button
      variant="outline-secondary"
      size="sm"
      class="mt-3"
      :disabled="busy"
      @click="emit('dismiss')"
    >
      {{ t("No names printed — start the questions") }}
    </b-button>
  </b-card>
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
