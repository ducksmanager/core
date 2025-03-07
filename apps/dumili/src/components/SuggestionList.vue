<template>
  <div :class="classes">
    <b-dropdown
      class="my-2 position-static z-1"
      :menu-class="['border-white', ...extraMenuClass]"
      :toggle-class="['text-wrap', ...(current ? itemClass(current) : [])]"
      ><b-dropdown-group
        v-for="(group, index) in [userSuggestions, aiSuggestions]"
        :key="index"
        header-class="d-none"
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
            ...((current?.id === suggestion.id &&
              selectedItemClass(suggestion)) ||
              []),
          ]"
          @click.stop="
            current = suggestion;
            emit('toggle-customize-form', false);
          "
        >
          <slot v-bind="{ suggestion, location: 'dropdown' }" />
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
          <slot
            v-if="current"
            v-bind="{ suggestion: current, location: 'button' }"
          />
          <slot v-else name="unknown-text" />
          <AiSuggestionIcon
            v-if="current && isAiSource(current)"
            status="success"
          /></div
      ></template>
    </b-dropdown>
    <slot v-if="showCustomizeForm" name="customize-form" />
  </div>
</template>
<script setup lang="ts" generic="S extends {id: number}">
const $slots = useSlots();

defineSlots<{
  default(data: { suggestion: S; location: "button" | "dropdown" }): never;
  "customize-form"(): never;
  "customize-text"(): never;
  "unknown-text"(): never;
}>();

const current = defineModel<S | null>();

const {
  class: classes,
  suggestions,
  isAiSource,
  itemClass = () => [],
  selectedItemClass = () => ["selected"],
  showCustomizeForm = false,
  extraMenuClass = [],
} = defineProps<{
  class: string;
  suggestions: S[];
  isAiSource: (suggestion: S) => boolean;
  itemClass?: (suggestion: S) => string[];
  selectedItemClass?: (suggestion: S) => string[];
  showCustomizeForm?: boolean;
  extraMenuClass?: string[];
}>();

const emit = defineEmits<{
  (e: "toggle-customize-form", toggle: boolean): void;
}>();

const { t: $t } = useI18n();

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

.dropdown-menu {
  background: lightgrey;
  overflow-x: visible !important;

  [role="group"] {
    color: black;
    font-weight: bold;
    font-style: italic;
  }
}

.badge,
.btn-group .btn,
.dropdown-item {
  color: black !important;
  &.selected {
    background: #eee !important;
  }

  &:hover {
    background: #ddd;
  }
}
</style>
