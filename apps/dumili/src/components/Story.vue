<template>
  <b>{{ storycode }}</b>
  <div>{{ storyDetails?.[storycode]?.title }}</div>
  <div><slot name="suffix" /></div>
</template>
<script setup lang="ts">
defineProps<{
  storycode: string;
}>();

useSlots();

const { storyDetails } = storeToRefs(coa());
</script>
