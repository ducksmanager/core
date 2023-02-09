<route lang="yaml">
alias:
  - /collection
  - /collection/show
</route>
<template>
  <Manage :publicationcode="publicationcode" />
</template>

<script lang="ts" setup>
const route = useRoute();
const publicationcode = $computed(() => (route.params.all as string) || null);
</script>
