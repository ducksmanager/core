<template>
  <li :class="{ active }">
    <a href="javascript:void(0)" class="d-flex align-items-center"
      ><i :class="icon" />
      <slot name="text" />
    </a>
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

const { path } = useRoute();

const active = $computed(() => paths.some((pathRegex) => pathRegex.test(path)));
</script>
