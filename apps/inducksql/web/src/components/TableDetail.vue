<script setup lang="ts">
import { ref, watch } from "vue";

import type { ColumnInfo, QueryResult, SchemaObject } from "../protocol";
import { columnsOf, runQuery } from "../useDatabase";
import ResultsGrid from "./ResultsGrid.vue";

const { table, objects } = defineProps<{
  table: string;
  objects: SchemaObject[];
}>();

const tab = ref<"rows" | "schema">("rows");
const columns = ref<ColumnInfo[]>([]);
const preview = ref<QueryResult | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    columns.value = await columnsOf(table);
    // Deliberately a bare LIMIT: no COUNT(*) and no OFFSET, both of which would scan the
    // whole table and drag it across the network a page at a time.
    preview.value = await runQuery(`SELECT * FROM "${table}" LIMIT 100`);
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught);
  } finally {
    loading.value = false;
  }
};

watch(() => table, load, { immediate: true });

const ddl = () =>
  objects
    .filter((object) => object.tableName === table && object.sql)
    .map((object) => `${object.sql};`)
    .join("\n\n");
</script>

<template>
  <section>
    <header>
      <h2>{{ table }}</h2>
      <nav>
        <button :class="{ active: tab === 'rows' }" @click="tab = 'rows'">
          First 100 rows
        </button>
        <button :class="{ active: tab === 'schema' }" @click="tab = 'schema'">
          Schema
        </button>
      </nav>
    </header>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted">Loading…</p>

    <template v-else-if="tab === 'rows'">
      <p class="muted">
        Showing at most 100 rows. Row counts are omitted on purpose:
        <code>COUNT(*)</code> would fetch the entire table over the network.
      </p>
      <ResultsGrid v-if="preview" :result="preview" />
    </template>

    <div v-else class="schema">
      <table>
        <thead>
          <tr>
            <th>column</th>
            <th>type</th>
            <th>null</th>
            <th>pk</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="column in columns" :key="column.name">
            <td>{{ column.name }}</td>
            <td class="muted">{{ column.type || "—" }}</td>
            <td>{{ column.notnull ? "NOT NULL" : "" }}</td>
            <td>{{ column.pk ? column.pk : "" }}</td>
          </tr>
        </tbody>
      </table>
      <pre>{{ ddl() }}</pre>
    </div>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--line);
}

h2 {
  margin: 0;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

nav {
  display: flex;
  gap: 0.35rem;
  margin-left: auto;
}

nav button {
  padding: 0.25rem 0.7rem;
  font: inherit;
  font-size: 0.75rem;
  color: var(--muted);
  background: none;
  border: 1px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
}

nav button.active {
  color: var(--bg);
  background: var(--accent);
  border-color: var(--accent);
}

.muted {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.73rem;
  color: var(--muted);
}

.error {
  margin: 0;
  padding: 0.55rem 0.75rem;
  font-size: 0.76rem;
  color: #fff;
  background: var(--danger);
}

.schema {
  min-height: 0;
  overflow: auto;
}

.schema table {
  border-collapse: collapse;
  font-size: 0.78rem;
}

.schema th,
.schema td {
  padding: 0.25rem 0.8rem 0.25rem 0.75rem;
  font-family: ui-monospace, Menlo, monospace;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.schema thead th {
  font-family: inherit;
  color: var(--muted);
  font-weight: 600;
}

pre {
  margin: 0;
  padding: 0.9rem 0.75rem;
  font-size: 0.72rem;
  line-height: 1.55;
  color: var(--muted);
  white-space: pre-wrap;
  border-top: 1px solid var(--line);
}

code {
  font-family: ui-monospace, Menlo, monospace;
}
</style>
