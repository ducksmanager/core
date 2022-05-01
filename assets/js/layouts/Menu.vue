<template>
  <div>
    <h3 v-if="title">
      {{ title }}
    </h3>
    <b-tabs v-if="items.length" class="my-4">
      <b-tab
        v-for="item in items"
        :key="JSON.stringify(item)"
        :active="isActive(item)"
        no-body
        @click.stop="onTabClick(item)"
      >
        <template #title>
          {{ item.text }}
        </template>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script setup>
import { BTab, BTabs } from "bootstrap-vue-3";
import { l10n } from "../stores/l10n";

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
  rootPath: {
    type: String,
    default: "/",
  },
  items: {
    type: Array,
    required: true,
  },
});
const { r } = l10n(),
  isActive = ({ path }) =>
    window.location.pathname === r(props.rootPath + path),
  onTabClick = (item) => {
    window.location.replace(
      isActive(item) ? "#" : r(props.rootPath + item.path)
    );
  };
</script>

<style scoped lang="scss">
:deep(.nav-link) {
  color: darkgrey !important;
  &.active {
    color: black !important;
  }
}
</style>
