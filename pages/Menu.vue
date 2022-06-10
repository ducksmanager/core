<template>
  <div>
    <h3 v-if="title">
      {{ title }}
    </h3>
    <b-tabs v-if="items.length" v-model="activeTabIndex" class="my-4">
      <b-tab
        v-for="item in items"
        :key="JSON.stringify(item)"
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

const { items, rootPath } = defineProps({
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
  activeTabIndex = $ref(
    items.findIndex(
      ({ path }) => window.location.pathname === r(rootPath + path)
    )
  ),
  onTabClick = ({ path }) => {
    window.location.replace(r(rootPath + path));
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
