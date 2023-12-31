<template>
  <router-view />
</template>

<script setup lang="ts">
const collectionStore = collection();

onBeforeMount(() => {
  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
