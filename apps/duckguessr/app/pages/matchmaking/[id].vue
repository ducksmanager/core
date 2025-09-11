<template>
  <div />
</template>

<script lang="ts">
export default defineNuxtRouteMiddleware((to) => {
  return navigateTo(to.path.replace("matchmaking", "game"));
});
</script>
