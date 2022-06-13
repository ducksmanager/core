<template>
  <div v-if="l10nRoutes">
    <h2 v-if="$slots.header">
      <slot name="header" />
    </h2>
    <slot />
  </div>
</template>

<script setup>
import { l10n } from "../stores/l10n";

const l10nRoutes = $computed(() => l10n().l10nRoutes);

definePageMeta({
  title: "DucksManager",
});
</script>

<style scoped lang="scss">
</style>
