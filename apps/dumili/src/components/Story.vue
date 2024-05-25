<template>
  <b>{{ suggestion?.storyversioncode }}</b
  >&nbsp;{{ suggestion }}
</template>
<script setup lang="ts">
import { storySuggestion } from "~prisma/client_dumili";

defineProps<{
  suggestion: storySuggestion;
}>();
</script>
