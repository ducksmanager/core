<template>
  <div
    v-if="positionInCanvas"
    class="cursor-position position-fixed p-2"
  >
    <div>{{ `X = ${positionInCanvas[0]} mm` }}</div>
    <div>{{ `Y = ${positionInCanvas[1]} mm` }}</div>
  </div>
</template>

<script setup lang="ts">
import { ui } from "~/stores/ui";

const { positionInCanvas } = storeToRefs(ui());
</script>
