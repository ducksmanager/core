<route lang="yaml">
alias:
  - /collection/afficher
</route>
<template>
  <Manage v-if="publicationcode" :publicationcode="publicationcode" />
</template>

<script lang="ts" setup>
const route = useRoute<'/collection/afficher/[...all]'>();
const publicationcode = computed(() => route.params.all);
</script>
