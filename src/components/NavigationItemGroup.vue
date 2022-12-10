<template>
  <li
    data-toggle="collapse"
    :data-target="`#${path}`"
    :class="{ collapsed: true, active }"
  >
    <a href="#"
      ><i :class="{ [icon]: true }" />
      <slot name="text" />
      <span class="arrow"
    /></a>
    <ul :id="path" class="sub-menu collapse in show">
      <slot name="items" />
    </ul>
  </li>
</template>

<script setup lang="ts">
const { path } = defineProps<{
  path: string;
  icon: string;
}>();
const active = $computed(() =>
  window.location.pathname.split("/").includes(path)
);
</script>

<style lang="scss" scoped>

</style>
