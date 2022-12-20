<template>
  <li :class="{ active }">
    <a href="javascript:void(0)"
      ><i :class="{ [icon]: true }" />
      <slot name="text" />
      <span class="arrow"
    /></a>
    <ul class="sub-menu collapse in show">
      <slot name="items" />
    </ul>
  </li>
</template>

<script setup lang="ts">
const { paths } = defineProps<{
  paths: RegExp[];
  icon: string;
}>();

const active = $computed(() =>
  paths.some((path) => path.test(useRoute().path))
);
</script>
