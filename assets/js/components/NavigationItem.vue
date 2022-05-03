<template>
  <li :class="{ 'non-empty': true, 'no-icon': !icon, active }">
    <a :href="r(path)">
      <i :class="{ [icon]: true }" />
      <slot />
    </a>
  </li>
</template>

<script setup>
import { computed } from "vue";

import { l10n } from "../stores/l10n";

const props = defineProps({
    path: { type: String, required: true },
    icon: { type: String, default: null },
  }),
  { r } = l10n(),
  active = computed(
    () =>
      !r(props.path)
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
