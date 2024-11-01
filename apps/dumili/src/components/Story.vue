<template>
  <b>{{ story.storycode }}</b
  ><br />{{ storyDetails?.[story.storycode]?.title }}
  <slot name="suffix" />
</template>
<script setup lang="ts">
defineProps<{
  story: {
    storycode: string;
  };
}>();

useSlots();

const { storyDetails } = storeToRefs(coa());
</script>
