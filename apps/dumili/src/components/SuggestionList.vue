<template>
  <b-dropdown
    class="my-2"
    :toggle-class="[
      'text-wrap',
      // @ts-ignore
      ...(itemClass && current ? itemClass(current) : []),
    ]"
    ><b-dropdown-group
      v-for="(group, index) in [userSuggestions, aiSuggestions]"
      :key="index"
      :header="
        index === 1
          ? `${$t('Suggestions IA')} ${aiSuggestions.length ? '' : $t('(Aucune)')}`
          : undefined
      "
    >
      <b-dropdown-item
        v-for="(suggestion, idx) of group"
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
          <slot v-bind="{ suggestion, isDropdownItem: true }" />
        </div>
        <AiSuggestionIcon v-if="isAiSource(suggestion)" status="success"
      /></b-dropdown-item>
    </b-dropdown-group>
    <b-dropdown-group>
      <b-dropdown-item
        @click="
          current = undefined;
          emit('toggle-customize-form', false);
        "
        ><slot name="unknown-text" /></b-dropdown-item
    ></b-dropdown-group>
    <template v-if="allowCustomizeForm">
      <b-dropdown-item @click="emit('toggle-customize-form', true)"
        ><slot name="customize-text" /></b-dropdown-item
    ></template>
    <template #button-content>
      <slot v-if="showCustomizeForm" name="customize-text" />
      <div v-else class="d-flex justify-content-between align-items-center">
        <div>
          <slot v-if="current" v-bind="{ suggestion: current }" />
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
const $slots = useSlots();

defineSlots<{
  default(data: { suggestion: S; isDropdownItem?: boolean }): never;
  "customize-form"(): never;
  "customize-text"(): never;
  "unknown-text"(): never;
}>();

const current = defineModel<S | null>();

const { suggestions, isAiSource } = withDefaults(
  defineProps<{
    suggestions: S[];
    isAiSource: (suggestion: S) => boolean;
    itemClass?: (suggestion: S) => string[];
    showCustomizeForm?: boolean;
  }>(),
  {
    itemClass: undefined,
    showCustomizeForm: false,
  },
);

const emit = defineEmits<{
  (e: "toggle-customize-form", toggle: boolean): void;
}>();

const allowCustomizeForm = computed(
  () => $slots["customize-form"] !== undefined,
);

const aiSuggestions = computed(() =>
  suggestions.filter((suggestion) => isAiSource(suggestion)),
);

const userSuggestions = computed(() =>
  suggestions.filter((suggestion) => !isAiSource(suggestion)),
);
</script>
<style lang="scss">
.dropdown-divider {
  border-color: white;
}
</style>
