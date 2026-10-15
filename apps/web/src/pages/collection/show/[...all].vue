<route lang="yaml">
alias:
  - /collection
  - /collection/show
</route>
<template>
  <Manage :publicationcode="collectionShowPublicationcode" />
</template>

<script lang="ts" setup>
const collectionShowRoute = useRoute<"/collection/show/[...all]">();
const collectionShowPublicationcode = computed(() =>
  collectionShowRoute.params.all === "_"
    ? undefined
    : collectionShowRoute.params.all,
);
</script>
 