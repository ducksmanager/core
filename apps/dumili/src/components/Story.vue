<template>
  <b>{{ entry.storyversion?.storycode }}</b
  >&nbsp;{{ entry.title }}
</template>
<script setup lang="ts">
import { EntrySuggestion } from "~/stores/suggestions";

defineProps<{
  entry: EntrySuggestion["data"];
}>();
</script>
