<template>
  <Teleport v-if="parentElement" :to="parentElement">
    <b-alert v-if="error.message" :model-value="true" variant="danger">
      {{ $t(error.message) }}
    </b-alert>
  </Teleport>
</template>

<script lang="ts" setup>
import type { ScopedError } from "socket-call-client";

const { error } = defineProps<{
  error: ScopedError;
}>();

const parentElement = $computed(
  () => error.selector && document.querySelector(error.selector)?.parentElement,
);
</script>
