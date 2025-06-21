<template>
  <span v-if="number > 1">
    {{ $t("et") }} {{ number - 1 }}
    <template v-if="number === 2">
      {{ textSingle || $t("autre numéro") }}
    </template>
    <template v-else>
      {{ textMultiple || $t("autres numéros") }}
    </template>
  </span>
</template>

<script setup lang="ts">
const { textSingle = null, textMultiple = null } = defineProps<{
  number: number;
  textSingle?: string;
  textMultiple?: string;
}>();
</script>

<style scoped>

</style>
