<template>
  <details v-if="trail.length" class="card card-body py-2">
    <summary class="small fw-semibold text-body-secondary">
      {{ t("Your answers ({count})", { count: trail.length }) }}
    </summary>
    <ol class="list-unstyled small mt-2 mb-0">
      <li
        v-for="(entry, i) in trail"
        :key="`${entry.key}-${i}`"
        class="d-flex justify-content-between gap-3 py-2 border-top"
      >
        <span class="text-body-secondary">{{ tm(entry.prompt) }}</span>
        <span class="fw-semibold text-nowrap">{{ tm(entry.answer) }}</span>
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
