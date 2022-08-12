<template>
  <Manage
    :publicationcode="route.params.all"
  />
</template>

<script setup lang="ts">
const route = useRoute()
</script>
