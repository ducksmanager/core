<template>
  <li
    data-toggle="collapse"
    :data-target="`#${path}`"
    :class="{ collapsed: true, active }"
  >
    <NuxtLink href="#"
      ><i :class="{ [icon]: true }" />
      <slot name="text" />
      <span class="arrow"
    /></NuxtLink>
    <ul :id="path" class="sub-menu collapse in show">
      <slot name="items" />
    </ul>
  </li>
</template>

<script setup>
const props = defineProps({
  path: { type: String, required: true },
  icon: { type: String, required: true },
});
const route = useRoute();
const active = $computed(() => route.path.split("/").includes(props.path));
</script>

<style lang="scss" scoped>

</style>
