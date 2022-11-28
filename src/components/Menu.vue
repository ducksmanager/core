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
        :disabled="item.disabled"
        @click.stop="router.push(rootPath + item.path)"
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
const router = useRouter();
const routeName = useRoute().name;
const activeTabIndex = $ref(
  items.findIndex(
    ({ path }) => routeName === (rootPath + path).replace(/\//g, "-")
  )
);
</script>

<style scoped lang="scss">
:deep(.nav-link) {
  color: white !important;
  &.active {
    color: black !important;
  }
  &.disabled {
    color: darkgrey !important;
  }
}
</style>
