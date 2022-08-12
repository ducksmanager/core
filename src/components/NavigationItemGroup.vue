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

<script setup>
const { path } = defineProps({
  path: { type: String, required: true },
  icon: { type: String, required: true },
});
const active = $computed(() =>
  window.location.pathname.split("/").includes(path)
);
</script>

<style lang="scss" scoped>

</style>
