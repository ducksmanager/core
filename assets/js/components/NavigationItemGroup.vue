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
import { computed } from "vue";

const props = defineProps({
    path: { type: String, required: true },
    icon: { type: String, required: true },
  }),
  active = computed(() =>
    window.location.pathname.split("/").includes(props.path)
  );
</script>

<style lang="scss" scoped>

</style>