<script setup lang="ts">
import type { AnsweredQuestion } from "~quackinator/types";

defineProps<{ trail: AnsweredQuestion[] }>();
</script>

<template>
  <details v-if="trail.length" class="trail">
    <summary>Your answers ({{ trail.length }})</summary>
    <ol>
      <li v-for="(entry, i) in trail" :key="`${entry.key}-${i}`">
        <span class="q">{{ entry.prompt }}</span>
        <span class="a">{{ entry.answer }}</span>
      </li>
    </ol>
  </details>
</template>

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
