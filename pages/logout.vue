<template>
  <NuxtLayout name="default">
    <template #title>{{ $t("Déconnexion") }}</template>
    <template #page-title>{{ $t("Déconnexion") }}</template>
  </NuxtLayout>
</template>

<script setup>
useAuthState().reset();
useRouter().push("/");
</script>

<style scoped>

</style>
