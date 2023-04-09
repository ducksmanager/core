<template>
  <div class="edit-wrapper">
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
</template>
<script setup lang="ts">
import { OptionValue } from "~/types/OptionValue";

const emit = defineEmits<{
  (e: "change", value: OptionValue): void;
}>();

const props = defineProps<{
  values: OptionValue[];
}>();

const edit = ref(false as boolean);
const isMultiple = computed(() => props.values.length > 1 && !edit.value);
</script>
