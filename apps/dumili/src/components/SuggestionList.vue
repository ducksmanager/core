<template>
  <b-dropdown
    class="my-2"
    :toggle-class="['text-wrap', ...(itemClass && getCurrent() ? itemClass(getCurrent()!) : [])]"
    ><b-dropdown-item
      v-for="(suggestion, idx) of suggestions"
      :key="`suggestion-${idx}`"
      :link-class="[
        'd-flex',
        'justify-content-between',
        'align-items-center',
        ...((itemClass && itemClass(suggestion)) || []),
      ]"
      @click="
        emit('select', suggestion);
        emit('toggle-customize-form', false);
      "
    >
      <div>
        <slot name="item" v-bind="suggestion" />
      </div>
      <AiSuggestionIcon v-if="isAiSource(suggestion)" status="success"
    /></b-dropdown-item>
    <b-dropdown-divider v-if="suggestions.length" />
    <b-dropdown-item
      @click="
        emit('select', undefined);
        emit('toggle-customize-form', false);
      "
      ><slot name="unknown-text"
    /></b-dropdown-item>
    <template v-if="allowCustomizeForm">
      <b-dropdown-divider />
      <b-dropdown-item @click="emit('toggle-customize-form', true)"
        ><slot name="customize-text" /></b-dropdown-item
    ></template>
    <template #button-content>
      <slot v-if="showCustomizeForm" name="customize-text" />
      <div v-else class="d-flex justify-content-between align-items-center">
        <div>
          <slot v-if="getCurrent()" name="item" v-bind="getCurrent()!" />
          <slot v-else name="unknown-text" />
        </div>
        <AiSuggestionIcon
          v-if="getCurrent() && isAiSource(getCurrent()!)"
          status="success"
        /></div
    ></template>
  </b-dropdown>
  <slot v-if="showCustomizeForm" name="customize-form" />
</template>
<script setup lang="ts" generic="S extends Partial<issueSuggestion|storyKindSuggestion|storySuggestion>">
import {
  issueSuggestion,
  storyKindSuggestion,
  storySuggestion,
} from "~prisma/client_dumili";

const $slots = useSlots();

defineSlots<{
  default(props: { suggestion: S }): never;
  item(suggestion: S): never;
  "customize-form"(): never;
  "customize-text"(): never;
  "unknown-text"(): never;
}>();

withDefaults(
  defineProps<{
    suggestions: S[];
    getCurrent: () => S | undefined;
    itemClass?: (suggestion: S) => string[];
    showCustomizeForm?: boolean;
  }>(),
  {
    itemClass: undefined,
    showCustomizeForm: false,
  }
);

const allowCustomizeForm = computed(
  () => $slots["customize-form"] !== undefined
);

const isAiSource = (suggestion: S) =>
  "source" in suggestion && suggestion.source === "ai";

const emit = defineEmits<{
  (e: "select", suggestion?: S): void;
  (e: "toggle-customize-form", toggle: boolean): void;
}>();
</script>
<style lang="scss">
.dropdown-divider {
  border-color: grey;
}
</style>
