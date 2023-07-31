<template>
  <b-dropdown
    class="my-2"
    :toggle-class="itemClass && getCurrent() ? itemClass(getCurrent()!) : {}"
    ><b-dropdown-item
      v-for="(suggestion, idx) of suggestions"
      :key="`suggestion-${idx}`"
      class="d-flex"
      :class="itemClass ? itemClass(suggestion) : {}"
      @click="
        emit('select', suggestion);
        emit('show-customize-form', false);
      "
    >
      <slot name="item" v-bind="suggestion as S" />
      <AiSuggestionIcon v-if="suggestion.meta.source === 'ai'"
    /></b-dropdown-item>
    <b-dropdown-divider v-if="suggestions.length" />
    <b-dropdown-item><slot name="unknown" /></b-dropdown-item>
    <b-dropdown-divider />
    <b-dropdown-item
      v-if="allowCustomizeForm"
      @click="emit('show-customize-form', true)"
      ><slot v-if="$slots.customize" name="customize" /><template v-else>{{
        $t("Personnaliser...")
      }}</template></b-dropdown-item
    >
    <template #button-content>
      <template v-if="showCustomizeForm"
        ><slot v-if="$slots.customize" name="customize" /><template v-else>{{
          $t("Personnaliser...")
        }}</template></template
      >
      <div v-else class="d-flex">
        <slot v-if="!getCurrent()" name="unknown" />
        <slot v-else name="item" v-bind="(getCurrent() as S)" />
        <AiSuggestionIcon v-if="getCurrent()?.meta.source === 'ai'" /></div
    ></template>
  </b-dropdown>
  <slot v-if="showCustomizeForm" name="customize-form" />
</template>
<script setup lang="ts" generic="S extends Suggestion">
import { useI18n } from "vue-i18n";

import type { Suggestion } from "../stores/suggestions";

const $slots = useSlots();

defineSlots<{
  default(props: { issuecode: string }): never;
  item(suggestion: S): never;
  "customize-form"(): never;
  customize(): never;
  unknown(): never;
}>();

defineProps<{
  suggestions: S[];
  getCurrent: () => S | undefined;
  showCustomizeForm: boolean;
  allowCustomizeForm: boolean;
  itemClass?: (suggestion: S) => Record<string, boolean>;
}>();

const { t: $t } = useI18n();

const emit = defineEmits<{
  (e: "select", suggestion?: S): void;
  (e: "show-customize-form", show: boolean): void;
}>();
</script>
<style lang="scss">
.dropdown-divider {
  border-color: grey;
}
</style>
