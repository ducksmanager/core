<template>
  <b-dropdown
    class="my-2"
    :toggle-class="[
      'text-wrap',
      // @ts-ignore
      ...(itemClass && current ? itemClass(current) : []),
    ]"
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
        current = suggestion;
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
        current = undefined;
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
          <slot v-if="current" name="item" v-bind="current" />
          <slot v-else name="unknown-text" />
        </div>
        <AiSuggestionIcon
          v-if="current && isAiSource(current)"
          status="success"
        /></div
    ></template>
  </b-dropdown>
  <slot v-if="showCustomizeForm" name="customize-form" />
</template>
<script setup lang="ts" generic="S extends {id: number}">
import { Reactive } from "vue";

const $slots = useSlots();

defineSlots<{
  default(suggestion: Reactive<S>): never;
  item(suggestion: Reactive<S>): never;
  "customize-form"(): never;
  "customize-text"(): never;
  "unknown-text"(): never;
}>();

const current = defineModel<Reactive<S> | null>();

withDefaults(
  defineProps<{
    suggestions: S[];
    isAiSource: (suggestion: Reactive<S>) => boolean;
    itemClass?: (suggestion: Reactive<S>) => string[];
    showCustomizeForm?: boolean;
  }>(),
  {
    itemClass: undefined,
    showCustomizeForm: false,
  },
);

const allowCustomizeForm = computed(
  () => $slots["customize-form"] !== undefined,
);

const emit = defineEmits<{
  (e: "toggle-customize-form", toggle: boolean): void;
}>();
</script>
<style lang="scss">
.dropdown-divider {
  border-color: white;
}
</style>
