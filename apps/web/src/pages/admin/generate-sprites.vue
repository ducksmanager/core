<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import { PUT__edgecreator__edgesprites } from "api-routes";
import axios from "axios";

import { call } from "~/util/axios";

const generateSprites = async () => {
  await call(axios, new PUT__edgecreator__edgesprites());
};
</script>
