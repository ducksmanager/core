<template>
  <b-dropdown class="my-2"
    ><b-dropdown-item
      v-for="(suggestion, idx) of suggestions"
      :key="`suggestion-${idx}`"
      class="d-flex"
      @click="emit('select', suggestion)"
    >
      <slot name="item" :suggestion="suggestion" />
      <AiSuggestionIcon v-if="suggestion.type === 'ai'"
    /></b-dropdown-item>
    <b-dropdown-divider v-if="suggestions.length" />
    <b-dropdown-item @click="emit('select', undefined)"
      ><slot name="unknown"
    /></b-dropdown-item>
    <b-dropdown-divider />
    <b-dropdown-item @click="showCustomizeForm = true"
      ><slot name="customize"
    /></b-dropdown-item>
    <template #button-content>
      <template v-if="showCustomizeForm"><slot name="customize" /></template>
      <div v-else class="d-flex">
        <slot name="item" :suggestion="getCurrent()" /><AiSuggestionIcon
          v-if="getCurrent().type === 'ai'"
        /></div
    ></template>
  </b-dropdown>
  <slot v-if="showCustomizeForm" name="customize-form" />
</template>
<script setup lang="ts" generic="S extends Suggestion">
import type { Suggestion } from "../stores/issueDetails";
const showCustomizeForm = ref(false);

defineSlots<{
  default(props: { issuecode: string }): never;
  item(props: { suggestion: S }): never;
  "customize-form"(): never;
  customize(): never;
  unknown(): never;
}>();

defineProps<{
  suggestions: S[];
  getCurrent: () => S;
}>();

const emit = defineEmits<{
  (e: "select", suggestion?: S): void;
}>();
</script>
