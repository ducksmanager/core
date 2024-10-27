<template>
  <b>{{ story.storyversioncode }}</b
  >&nbsp;{{ storyDetails?.[story.storyversioncode]?.title }}
  <slot name="suffix" />
</template>
<script setup lang="ts">
const { story } = defineProps<{
  story: {
    storyversioncode: string;
  };
}>();

useSlots();

const { storyDetails } = storeToRefs(coa());
</script>
