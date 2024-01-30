<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import { edgeCreatorServices } from "~/composables/useSocket";
const generateSprites = async () => {
  await edgeCreatorServices.uploadEdges();
};
</script>
