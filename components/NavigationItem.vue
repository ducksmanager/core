<template>
  <li :class="{ 'non-empty': true, 'no-icon': !icon, active }">
    <a :href="r(path)">
      <i :class="{ [icon]: true }" />
      <slot />
    </a>
  </li>
</template>

<script setup>
import { l10n } from "../stores/l10n";

const props = defineProps({
  path: { type: String, required: true },
  icon: { type: String, default: null },
});
const { r } = l10n();

const route = useRoute();
const active = $computed(
  () =>
    !r(props.path)
      .split("/")
      .find((pathPart) => !route.path.split("/").includes(pathPart)) &&
    !/(bibliotheque\/afficher)|(bookcase\/show\/).+$/.test(route.path)
);
</script>

<style scoped lang="scss">
a {
  &:hover {
    border: 0 !important;
  }
}
</style>
