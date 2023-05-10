<template>
  <span></span>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value?: string | undefined;
}>();

const backgroundColor = computed(() => {
  switch (props.value) {
    case 'good':
      return 'rgb(44, 167, 123)';
    case 'notsogood':
      return 'orange';
    case 'bad':
      return 'red';
    default:
      return 'rgb(128, 128, 128)';
  }
});
</script>
<style lang="scss">
span {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  display: inline-block;
  border-radius: 50%;
  background-color: v-bind(backgroundColor);
}
</style>
