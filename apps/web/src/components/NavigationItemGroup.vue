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

const route = useRoute();

const active = $computed(() => paths.some((path) => path.test(route.path)));
</script>
