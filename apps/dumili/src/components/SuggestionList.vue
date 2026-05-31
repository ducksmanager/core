<template>
  <div :class="classes">
    <b-dropdown
      class="position-relative z-1"
      style="width: calc(100% - 40px)"
      :menu-class="['border-white', 'min-w-100', ...extraMenuClass]"
      :contenteditable="textEditable || null"
      :toggle-class="[
        'text-wrap',
        'w-100',
        ...(current ? itemClass(current) : []),
      ]"
      ><b-dropdown-group
        v-for="(groupSuggestions, group) in groupedSuggestions"
        :key="group"
        :header-class="group === 'user' ? 'pb-0 pt-0' : ''"
        :header="
          group === 'previous'
            ? $t('Titres précédents')
            : group === 'ai'
              ? $t('Suggestions IA')
              : undefined
        "
      >
        <b-dropdown-item
          v-for="(suggestion, idx) of groupSuggestions"
          :key="`suggestion-${idx}`"
          :link-class="[
            'd-flex',
            'justify-content-between',
            'align-items-center',
            ...((itemClass && itemClass(suggestion)) || []),
            ...((current?.id === suggestion.id &&
              selectedItemClass(suggestion)) ||
              []),
            ...itemLinkClasses,
          ]"
          @click.stop="
            current = suggestion;
            showCustomizeForm = false;
          "
        >
          <slot v-bind="{ suggestion, location: 'dropdown' }" />
          <AiSuggestionIcon
            v-if="category(suggestion) === 'ai'"
            status="success"
        /></b-dropdown-item>
      </b-dropdown-group>
      <b-dropdown-group header-class="p-0">
        <b-dropdown-item
          @click="
            current = undefined;
            showCustomizeForm = false;
          "
          ><slot name="unknown-text" /></b-dropdown-item
      ></b-dropdown-group>
      <template v-if="allowCustomizeForm">
        <b-dropdown-item @click="showCustomizeForm = true"
          ><slot name="customize-text" /></b-dropdown-item
      ></template>
      <template #button-content>
        <slot v-if="showCustomizeForm" name="customize-text" />
        <div
          v-else
          class="d-flex w-100 justify-content-between align-items-center"
        >
          <slot
            v-if="current"
            v-bind="{ suggestion: current, location: 'button' }"
          />
          <slot v-else name="unknown-text" />
          <AiSuggestionIcon
            v-if="current && category(current) === 'ai'"
            status="success"
          /></div
      ></template>
    </b-dropdown>
    <slot v-if="showCustomizeForm" name="customize-form" />
  </div>
</template>
<script setup lang="ts" generic="S extends {id: number|string}">
const $slots = useSlots();

defineSlots<{
  default(data: { suggestion: S; location: "button" | "dropdown" }): never;
  "customize-form"(): never;
  "customize-text"(): never;
  "unknown-text"(): never;
}>();

const current = defineModel<S | null>();
const showCustomizeForm = defineModel<boolean>("showCustomizeForm", {
  default: false,
});

const {
  class: classes = "",
  itemLinkClasses = [],
  suggestions,
  category = () => "user",
  itemClass = () => [],
  selectedItemClass = () => ["selected"],
  extraMenuClass = [],
  textEditable = false,
} = defineProps<{
  class?: string;
  itemLinkClasses?: string[];
  suggestions: S[];
  category?: (suggestion: S) => "ai" | "user" | "previous";
  itemClass?: (suggestion: S) => string[];
  selectedItemClass?: (suggestion: S) => string[];
  extraMenuClass?: string[];
  textEditable?: boolean;
}>();

const { t: $t } = useI18n();

const allowCustomizeForm = computed(
  () => $slots["customize-form"] !== undefined,
);

const groupedSuggestions = computed(() =>
  Object.fromEntries(
    Object.entries(
      suggestions.groupBy((suggestion) => category(suggestion), "[]"),
    ).sort(([categoryA], [categoryB]) =>
      categoryA === "user"
        ? -1
        : categoryB === "user"
          ? 1
          : categoryA.localeCompare(categoryB),
    ),
  ),
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
