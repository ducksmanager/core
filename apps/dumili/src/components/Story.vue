<template>
  <b>{{ story.storyversioncode }}</b>
</template>
<script setup lang="ts">
defineProps<{
  story: {
    storyversioncode: string;
  };
}>();
</script>
