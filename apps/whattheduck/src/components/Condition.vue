<template>
  <span :class="`dm-condition-background ${value}`" />
</template>
<script setup lang="ts">
defineProps<{
  value?: string;
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
