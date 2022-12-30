<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import axios from "axios";

import routes from "~types/routes";

const generateSprites = async () => {
  await routes["PUT /edgecreator/edgesprites"](axios);
};
</script>
