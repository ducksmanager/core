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
  <ViewBookcase :username="username" />
</template>

<script lang="ts" setup>
const route = useRoute<"/bookcase/afficher/[username]">();
const username = computed(() => route.params.username);
</script>