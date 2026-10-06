<template>
  <details v-if="trail.length" class="trail">
    <summary>
      {{ t("Your answers ({count})", { count: trail.length }) }}
    </summary>
    <ol>
      <li v-for="(entry, i) in trail" :key="`${entry.key}-${i}`">
        <span class="q">{{ tm(entry.prompt) }}</span>
        <span class="a">{{ tm(entry.answer) }}</span>
      </li>
    </ol>
  </details>
</template>

<script setup lang="ts">
import { useQuackinatorI18n } from "~quackinator/i18n";
import type { AnsweredQuestion } from "~quackinator/types";

defineProps<{ trail: AnsweredQuestion[] }>();

const { t, tm } = useQuackinatorI18n();
</script>

<style scoped>
.trail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1.1rem;
}

summary {
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}

ol {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.88rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.q {
  color: var(--muted);
}

.a {
  font-weight: 600;
  white-space: nowrap;
}
</style>
