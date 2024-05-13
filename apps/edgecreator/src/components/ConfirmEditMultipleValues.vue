<template>
  <div class="w-100">
    <slot name="before" />
    <div
      class="d-flex flex-row justify-space-around align-items-center edit-wrapper"
    >
      <template v-if="isMultiple">
        {{ $t("Multiple values.") }}
        <b-button
          size="sm"
          pill
          @click="
            edit = true;
            emit('change', values[0]);
          "
          >{{ $t("Edit") }}</b-button
        >
      </template>
      <slot v-else />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { OptionValue } from "~/types/OptionValue";

const emit = defineEmits<(e: "change", value: OptionValue) => void>();

const props = defineProps<{
  values: OptionValue[];
}>();

const edit = ref<boolean>(false);
const isMultiple = computed(() => props.values.length > 1 && !edit.value);
</script>
