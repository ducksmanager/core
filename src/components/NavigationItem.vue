<template>
  <li class="non-empty" :class="{ 'no-icon': !icon, active }">
    <router-link :to="path">
      <i :class="{ [icon]: true }" />
      <slot />
    </router-link>
  </li>
</template>

<script setup>
const props = defineProps({
  path: { type: String, required: true },
  icon: { type: String, default: null },
});
const active = $computed(
  () =>
    !props.path
      .split("/")
      .find(
        (pathPart) => !window.location.pathname.split("/").includes(pathPart)
      ) &&
    !/(bibliotheque\/afficher)|(bookcase\/show\/).+$/.test(
      window.location.pathname
    )
);
</script>

<style scoped lang="scss">
a {
  &:hover {
    border: 0 !important;
  }
}
</style>
