<template>
  <Teleport v-if="parentElement" :to="parentElement">
    <ion-label v-if="error.message" :model-value="true" variant="danger">
      {{ $t(error.message) }}
    </ion-label>
  </Teleport>
</template>

<script lang="ts" setup>
import type { ScopedError } from '~socket.io-services';

const { error } = defineProps<{
  error: ScopedError;
}>();

const parentElement = computed(() => error.selector && document.querySelector(error.selector)?.parentElement);
</script>
