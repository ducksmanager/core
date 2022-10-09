<template>
  <li class="non-empty" :class="{ 'no-icon': !icon, active }">
    <a :href="r(path)">
      <i :class="{ [icon]: true }" />
      <slot />
    </a>
  </li>
</template>

<script setup>
import { l10n } from "~/stores/l10n";

const { path } = defineProps({
  path: { type: String, required: true },
  icon: { type: String, default: null },
});
const { r } = l10n();
const active = $computed(
  () =>
    !r(path)
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
