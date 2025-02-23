<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
const { edgeCreator: edgeCreatorEvents } = injectLocal(socketInjectionKey)!;
const generateSprites = async () => {
  await edgeCreatorEvents.uploadEdges();
};
</script>
