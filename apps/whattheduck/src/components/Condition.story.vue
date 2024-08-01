<template>
  <Story
    ><Variant :title="condition" v-for="condition of ['mauvais', 'moyen', 'bon', 'indefini'] as const"
      ><Condition :value="condition" /></Variant
  ></Story>
</template>
<script setup lang="ts">
import Condition from './Condition.vue';
</script>
