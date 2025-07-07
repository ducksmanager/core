<template>
  <div>
    <template v-if="slots.title"><slot name="title" /></template>
    <h3 v-else-if="title">
      {{ title }}
    </h3>
    <b-tabs v-if="items.length" class="my-4">
      <b-tab
        v-for="(item, index) in items"
        :key="JSON.stringify(item)"
        no-body
        :active="activeTabIndex === index"
      >
        <template #title>
          <router-link :to="(item.route as string).replace('/[...all]', '')"
            >{{ item.text
            }}<template v-if="item.isNew"
              >&nbsp;<sup>{{ $t("Nouveau !") }}</sup></template
            >
          </router-link>
        </template>
      </b-tab></b-tabs
    >
  </div>
</template>

<script setup lang="ts">
import { RouteNamedMap } from "vue-router/auto-routes";

const { title = null, items } = defineProps<{
  title?: string;
  items: readonly {
    route: keyof RouteNamedMap;
    text: string;
    isNew?: boolean | false;
  }[];
}>();
const { name: routeName } = useRoute();
const slots = useSlots();

const activeTabIndex = computed(() =>
  items.findIndex((item) => item.route === routeName),
);
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
