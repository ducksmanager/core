<template>
  <b-tooltip :target="id" click><slot /></b-tooltip>
  <AiSuggestionIcon :id="id" status="info" :disabled="disabled" />
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);
defineSlots();
</script>