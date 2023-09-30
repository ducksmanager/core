<template>
  <Teleport v-if="parentElement" :to="parentElement">
    <b-alert v-if="error.message" :model-value="true" variant="danger">
      {{ $t(error.message) }}
    </b-alert>
  </Teleport>
</template>

<script lang="ts" setup>
import { ScopedError } from "~dm-types/ScopedError";
const { error } = defineProps<{
  error: ScopedError;
}>();

const parentElement = $computed(
  () => error.selector && document.querySelector(error.selector)?.parentElement,
);
</script>
