<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
const {
  edgeCreator: { services: edgeCreatorServices },
} = inject(socketInjectionKey)!;
const generateSprites = async () => {
  await edgeCreatorServices.uploadEdges();
};
</script>
