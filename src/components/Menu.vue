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
        @click.stop="router.push(`${rootPath}${item.path}`)"
      >
        <template #title>
          <router-link :to="`${rootPath}${item.path}`">{{
            item.text
          }}</router-link>
        </template>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script setup lang="ts">
import { BTab, BTabs } from "bootstrap-vue-3";

const {
  title = null,
  items,
  rootPath = "/",
} = defineProps<{
  title?: string;
  rootPath?: string;
  items: { path: string; text: string }[];
}>();
const router = useRouter();
const routeName = useRoute().name;
let activeTabIndex = $ref(-1 as number);

const updateActiveTabIndex = () => {
  activeTabIndex = items.findIndex(
    ({ path }) =>
      routeName === (rootPath + path).replace(/\//g, "-").replace(/^-/, "")
  );
};

watch(() => items, updateActiveTabIndex, { immediate: true });
watch(() => rootPath, updateActiveTabIndex);
</script>

<style scoped lang="scss">
:deep(button) {
  color: white !important;
  a {
    border-bottom: 0;
  }
  &.active {
    a {
      color: black !important;
    }
  }
  &.disabled {
    a {
      color: darkgrey !important;
    }
  }
}
</style>
