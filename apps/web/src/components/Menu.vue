<template>
  <div>
    <template v-if="slots.title"><slot name="title" /></template>
    <h3 v-else-if="title">
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
          <router-link :to="`${rootPath}${item.path}`"
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
const {
  title = null,
  items,
  rootPath = "/",
} = defineProps<{
  title?: string;
  rootPath?: string;
  items: { path: string; text: string; isNew?: boolean | false }[];
}>();
const router = useRouter();
const { name: routeName } = useRoute();
const slots = useSlots();

let activeTabIndex = $ref(-1 as number);

const updateActiveTabIndex = () => {
  activeTabIndex = items.findIndex(
    ({ path }) =>
      routeName === (rootPath + path).replace(/\//g, "-").replace(/^-/, ""),
  );
};

watch([$$(items), $$(rootPath)], updateActiveTabIndex, { immediate: true });
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
