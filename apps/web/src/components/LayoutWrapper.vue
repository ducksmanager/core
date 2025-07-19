<template>
  <bare v-if="currentLayout === 'bare'" />
  <default v-else />
</template>

<script setup lang="ts">
import { useLayout } from "~/composables/useLayout";

const { currentLayout } = useLayout();
</script> 