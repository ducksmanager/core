<template>
  {{ title }}
</template>

<script setup lang="ts">
defineProps<{ publicationcode: string; title: string }>();
</script>
