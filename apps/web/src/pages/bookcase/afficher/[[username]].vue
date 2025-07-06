<route lang="yaml">
meta:
  public: true
</route>
<template>
  <h5>
    <b>{{
      $t("Bibliothèque DucksManager de {username}", {
        username,
      })
    }}</b>
  </h5>
  <ViewBookcase />
</template>

<script lang="ts" setup>
const route = useRoute<"/bookcase/afficher/[[username]]">();
const username = computed(
  () => route.params.username || collection().user?.username,
);
</script>