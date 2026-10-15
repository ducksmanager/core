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
const bookcaseShowRoute = useRoute<"/bookcase/show/[username]">();
const username = computed(() => bookcaseShowRoute.params.username);
</script>
