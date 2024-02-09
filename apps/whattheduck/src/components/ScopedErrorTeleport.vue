<template>
  <Teleport v-if="parentElement" :to="parentElement">
    <ion-label v-if="error.message" :model-value="true" variant="danger">
      {{ t(error.message) }}
    </ion-label>
  </Teleport>
</template>

<script lang="ts" setup>
import { ScopedError } from "~socket.io-services/types";

const { t } = useI18n();
const props = defineProps<{
  error: ScopedError;
}>();

const parentElement = computed(
  () => props.error.selector && document.querySelector(props.error.selector)?.parentElement,
);
</script>
