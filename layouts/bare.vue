<template>
  <div>
    <h2 v-if="$slots.header">
      <slot name="header" />
    </h2>
    <slot />
  </div>
</template>

<script setup>
useHead({
  title: "DucksManager",
});
</script>

<style scoped lang="scss">
</style>
