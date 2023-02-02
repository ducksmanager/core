<template>
  <main-layout :title="title"
    ><strong class="capitalize">{{ title }}</strong></main-layout
  >
</template>
<script setup lang="ts">
import MainLayout from "../MainLayout.vue";
const title = "About";
</script>
