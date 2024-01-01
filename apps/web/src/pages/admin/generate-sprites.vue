<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import {
  NamespaceEndpoint as EdgeCreatorNamespaceEndpoint,
  Services as EdgeCreatorServices,
} from "~services/edgecreator/types";
const services = useSocket<EdgeCreatorServices>(EdgeCreatorNamespaceEndpoint);

const generateSprites = async () => {
  await services("uploadEdges");
};
</script>
