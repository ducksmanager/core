<route lang="yaml">
alias:
  - /collection/afficher
</route>
<template>
  <Manage :publicationcode="collectionAfficherPublicationcode" />
</template>

<script lang="ts" setup>
const collectionAfficherRoute = useRoute<"/collection/afficher/[...all]">();
const collectionAfficherPublicationcode = computed(() =>
  collectionAfficherRoute.params.all === "_"
    ? undefined
    : collectionAfficherRoute.params.all,
);
</script>
