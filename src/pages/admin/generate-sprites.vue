<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import axios from "axios";

import { PUT__edgecreator__edgesprites } from "~types/routes";

const generateSprites = async () => {
  await PUT__edgecreator__edgesprites(axios);
};
</script>
