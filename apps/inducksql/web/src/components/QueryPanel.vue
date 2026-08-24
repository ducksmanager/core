<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import type { QueryResult } from "../protocol";
import { runQuery } from "../useDatabase";
import ResultsGrid from "./ResultsGrid.vue";

const sqlParam = "sql";

const shared = new URLSearchParams(window.location.search).get(sqlParam);
const sql = ref(shared ?? "");

const limit = ref(200);
const result = ref<QueryResult | null>(null);
const error = ref<string | null>(null);
const running = ref(false);

const scans = computed(
  () => result.value?.plan.filter((line) => /^SCAN\b/.test(line.trim())) ?? [],
);

const run = async () => {
  if (running.value || !sql.value.trim()) return;
  running.value = true;
  error.value = null;

  // replaceState, so repeated runs do not stack history entries.
  const url = new URL(window.location.href);
  url.searchParams.set(sqlParam, sql.value);
  window.history.replaceState(null, "", url);

  try {
    result.value = await runQuery(sql.value, limit.value);
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught);
    result.value = null;
  } finally {
    running.value = false;
  }
};

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

onMounted(() => {
  if (shared) run();
});
</script>

<template>
  <section>
    <textarea
      v-model="sql"
      spellcheck="false"
      @keydown.meta.enter.prevent="run"
      @keydown.ctrl.enter.prevent="run"
    />

    <div class="toolbar">
      <button :disabled="running" @click="run">
        {{ running ? "Running…" : "Run" }}
      </button>
      <span class="hint">⌘/Ctrl + Enter</span>
      <label>
        Auto-LIMIT
        <input v-model.number="limit" type="number" min="1" max="5000" />
      </label>
      <span v-if="result" class="cost">
        {{ result.rows.length }} rows · {{ result.elapsedMs.toFixed(0) }} ms ·
        {{ result.cost.rangeRequests }} requests ·
        {{ kb(result.cost.bytesFetched) }} fetched
      </span>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="scans.length" class="warn">
      Full table scan — on a range-request VFS this downloads the whole table.
      Add an indexed <code>WHERE</code> or a <code>LIMIT</code>.
      <span v-for="line in scans" :key="line" class="plan">{{ line }}</span>
    </p>

    <ResultsGrid v-if="result" :result="result" />
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

textarea {
  height: 11rem;
  padding: 0.75rem;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--text);
  resize: vertical;
  background: var(--surface);
  border: 0;
  border-bottom: 1px solid var(--line);
}

textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--line);
}

button {
  padding: 0.3rem 0.9rem;
  font: inherit;
  font-size: 0.8rem;
  color: var(--bg);
  background: var(--accent);
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

.hint,
.cost {
  font-size: 0.72rem;
  color: var(--muted);
}

.cost {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

label {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  font-size: 0.72rem;
  color: var(--muted);
}

label input {
  width: 4.5rem;
  padding: 0.2rem 0.3rem;
  font: inherit;
  font-size: 0.72rem;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 3px;
}

.error,
.warn {
  margin: 0;
  padding: 0.55rem 0.75rem;
  font-size: 0.76rem;
  border-bottom: 1px solid var(--line);
}

.error {
  color: #fff;
  background: var(--danger);
}

.warn {
  color: var(--warn-text);
  background: var(--warn-bg);
}

.plan {
  display: block;
  margin-top: 0.2rem;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.7rem;
  opacity: 0.85;
}

code {
  font-family: ui-monospace, Menlo, monospace;
}
</style>
