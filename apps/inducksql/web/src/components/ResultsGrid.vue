<script setup lang="ts">
import type { QueryResult, SqlValue } from "../protocol";

const { result } = defineProps<{ result: QueryResult }>();

const render = (value: SqlValue) => {
  if (value === null) return "NULL";
  if (value === "") return "''";
  if (value instanceof Uint8Array || value instanceof Int8Array) {
    return `<${value.byteLength} bytes>`;
  }
  if (value instanceof ArrayBuffer) return `<${value.byteLength} bytes>`;
  return String(value);
};
</script>

<template>
  <div v-if="!result.columns.length" class="empty">
    Statement returned no columns.
  </div>
  <div v-else-if="!result.rows.length" class="empty">No rows.</div>
  <div v-else class="scroll">
    <table>
      <thead>
        <tr>
          <th class="gutter"></th>
          <th v-for="column in result.columns" :key="column">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in result.rows" :key="index">
          <td class="gutter">{{ index + 1 }}</td>
          <td
            v-for="(value, column) in row"
            :key="column"
            :class="{ null: value === null, empty: value === '' }"
          >
            {{ render(value) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.empty {
  padding: 1.25rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

table {
  border-collapse: collapse;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

th,
td {
  max-width: 28rem;
  padding: 0.25rem 0.6rem;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
  background: var(--surface);
}

.gutter {
  position: sticky;
  left: 0;
  color: var(--muted);
  text-align: right;
  background: var(--surface);
}

td.null,
td.empty {
  color: var(--muted);
  font-style: italic;
}

tbody tr:hover td:not(.gutter) {
  background: var(--hover);
}
</style>
