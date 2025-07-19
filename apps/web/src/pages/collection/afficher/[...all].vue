<route lang="yaml">
alias:
  - /collection/afficher
</route>
<template>
  <Manage :publicationcode="publicationcode" />
</template>

<script lang="ts" setup>
const route = useRoute<"/collection/afficher/[...all]">();
const publicationcode = computed(() => route.params.all);
</script>
