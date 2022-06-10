<template>
  <div>
    <b-alert v-if="errors[id]" show variant="danger">
      {{ $t(errors[id]) }}
    </b-alert>
    <slot />
  </div>
</template>

<script setup>
import { BAlert } from "bootstrap-vue-3";

import { form } from "../stores/form";

defineProps({
  id: {
    type: String,
    required: true,
  },
});

const errors = $computed(() => form().errors);
</script>

<style scoped lang="scss">
input {
  margin-top: 8px !important;
}
.alert {
  margin-top: 1rem;
  margin-bottom: 0;

  + input {
    margin-top: 0 !important;
  }
}
</style>
