<template>
  <span :class="`dm-condition-background ${value}`"></span>
</template>
<script setup lang="ts">
defineProps<{
  value?: string | undefined;
}>();
</script>
<style lang="scss">
span {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  display: inline-block;
  border-radius: 50%;
}
</style>
