<template>
  <div v-if="values.length > 1 && !edit" class="edit-wrapper">
    {{ $t("Multiple values.") }}
    <b-button
      size="sm"
      pill
      @click="
        edit = true;
        $emit('change', values[0]);
      "
      >{{ $t("Edit") }}</b-button
    >
  </div>
  <div v-else class="edit-wrapper"><slot /></div>
</template>
<script setup lang="ts">
import { OptionValue } from "~/types/OptionValue";

defineProps<{
  values: OptionValue[];
}>();

const edit = ref(false as boolean);
</script>
