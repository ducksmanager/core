<template>
  <Teleport v-if="parentElement" :to="parentElement">
    <ion-label v-if="error.message" :model-value="true" variant="danger">
      {{ $t(error.message) }}
    </ion-label>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { ScopedError } from '~dm-types/ScopedError';

const props = defineProps<{
  error: ScopedError;
}>();

const parentElement = computed(
  () => props.error.selector && document.querySelector(props.error.selector)?.parentElement,
);
</script>
