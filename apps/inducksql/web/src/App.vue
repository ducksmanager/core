<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import QueryPanel from "./components/QueryPanel.vue";
import SchemaSidebar from "./components/SchemaSidebar.vue";
import TableDetail from "./components/TableDetail.vue";
import {
  connect,
  databaseUrl,
  error,
  info,
  schema,
  stats,
  status,
} from "./useDatabase";

const view = ref<"table" | "query">("query");
const selected = ref<string | null>(null);

onMounted(connect);

const select = (table: string) => {
  selected.value = table;
  view.value = "table";
};

const mb = (bytes: number) => `${(bytes / 1024 ** 2).toFixed(0)} MB`;
const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

const share = computed(() =>
  info.value && info.value.sizeBytes
    ? `${((stats.value.bytesFetched / info.value.sizeBytes) * 100).toFixed(3)}%`
    : "—",
);
</script>

<template>
  <header class="bar">
    <strong>inducksql</strong>
    <span class="url" :title="databaseUrl">{{ databaseUrl }}</span>
    <span v-if="info" class="meta">
      {{ mb(info.sizeBytes) }} · {{ info.pageSize / 1024 }} KB pages
    </span>
    <span class="transfer">
      fetched {{ kb(stats.bytesFetched) }} ({{ share }}) in
      {{ stats.rangeRequests }} range requests · {{ stats.blockHits }} cache
      hits
    </span>
  </header>

  <p v-if="status === 'connecting'" class="notice">
    Opening the database over HTTP range requests…
  </p>
  <p v-else-if="status === 'error'" class="notice error">
    {{ error }}
    <span
      >— is the artifact being served with <code>Range</code> support? Try
      <code>pnpm -F '~inducksql' dev:db</code>.</span
    >
  </p>

  <main v-else>
    <SchemaSidebar :objects="schema" :selected="selected" @select="select" />
    <div class="panel">
      <nav class="tabs">
        <button :class="{ active: view === 'query' }" @click="view = 'query'">
          SQL
        </button>
        <button
          :class="{ active: view === 'table' }"
          :disabled="!selected"
          @click="view = 'table'"
        >
          {{ selected ?? "Table" }}
        </button>
      </nav>
      <TableDetail
        v-if="view === 'table' && selected"
        :table="selected"
        :objects="schema"
      />
      <QueryPanel v-else />
    </div>
  </main>
</template>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: baseline;
  padding: 0.55rem 0.85rem;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.url,
.meta,
.transfer {
  overflow: hidden;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transfer {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

.notice {
  margin: 0;
  padding: 1rem 0.85rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.notice.error {
  color: #fff;
  background: var(--danger);
}

main {
  display: grid;
  grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
  min-height: 0;
}

.panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.tabs {
  display: flex;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem 0;
}

.tabs button {
  padding: 0.3rem 0.85rem;
  font: inherit;
  font-size: 0.76rem;
  color: var(--muted);
  background: none;
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
}

.tabs button.active {
  color: var(--text);
  background: var(--surface);
}

.tabs button:disabled {
  opacity: 0.45;
  cursor: default;
}

@media (max-width: 40rem) {
  main {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 12rem minmax(0, 1fr);
  }
}
</style>
