<script setup lang="ts">
import { computed, ref } from "vue";

import type { SchemaObject } from "../protocol";

const { objects, selected } = defineProps<{
  objects: SchemaObject[];
  selected: string | null;
}>();

const emit = defineEmits<{ select: [table: string] }>();

const filter = ref("");

const tables = computed(() => {
  const listed = objects.filter(
    (object) => object.type === "table" || object.type === "view",
  );
  const needle = filter.value.trim().toLowerCase();
  return (
    needle
      ? listed.filter((object) => object.name.toLowerCase().includes(needle))
      : listed
  ).toSorted((a, b) => a.name.localeCompare(b.name));
});

const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const exact = new Intl.NumberFormat();
</script>

<template>
  <aside>
    <input v-model="filter" type="search" placeholder="Filter tables…" />
    <p class="count">
      {{ tables.length }} of
      {{
        objects.filter((o) => o.type === "table" || o.type === "view").length
      }}
      tables
    </p>
    <ul>
      <li v-for="table in tables" :key="table.name">
        <button
          :class="{ active: table.name === selected }"
          @click="emit('select', table.name)"
        >
          <span class="name">{{ table.name }}</span>
          <span
            v-if="table.rowCount !== null"
            class="badge"
            :title="`${exact.format(table.rowCount)} rows`"
          >
            {{ compact.format(table.rowCount) }}
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--line);
  background: var(--surface);
}

input {
  margin: 0.75rem;
  padding: 0.4rem 0.55rem;
  font: inherit;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
}

.count {
  margin: 0 0.75rem 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
}

ul {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0 0 0.75rem;
  overflow-y: auto;
  list-style: none;
}

button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.3rem 0.75rem;
  font: inherit;
  font-size: 0.8rem;
  color: var(--text);
  text-align: left;
  background: none;
  border: 0;
  cursor: pointer;
}

button:hover {
  background: var(--hover);
}

button.active {
  color: var(--bg);
  background: var(--accent);
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  flex-shrink: 0;
  padding: 0 0.35rem;
  font-size: 0.7rem;
  color: var(--muted);
  background: var(--hover);
  border-radius: 8px;
}

button.active .badge {
  color: var(--bg);
  background: rgb(255 255 255 / 25%);
}
</style>
