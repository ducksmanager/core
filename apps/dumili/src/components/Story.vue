<template>
  <b>{{ storycode }}</b
  ><br />{{ storyDetails?.[storycode]?.title }}
  <slot name="suffix" />
</template>
<script setup lang="ts">
defineProps<{
  storycode: string;
}>();

useSlots();

const { storyDetails } = storeToRefs(coa());
</script>
