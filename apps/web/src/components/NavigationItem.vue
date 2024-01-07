<template>
  <li class="non-empty" :class="{ 'no-icon': !icon, active }">
    <slot />
  </li>
</template>

<script setup lang="ts">
import { RouteRecordNormalized } from "vue-router";

const { route = null, icon = null } = defineProps<{
  route?: RouteRecordNormalized;
  icon?: string;
}>();

const { path: currentPath } = useRoute();

const active = $computed(() => currentPath === route?.path);
</script>

<style scoped lang="scss">
a {
  &:hover {
    border: 0 !important;
  }
}
</style>
