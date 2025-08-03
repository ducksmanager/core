<template>
  <DefineTemplate>
    <span v-if="'icon' in item" class="icon">
      <component :is="item.icon" />
    </span>
    {{ item.title }}
  </DefineTemplate>
  <BNavbarNav>
    <BNavItem
      class="d-flex align-items-center w-100"
      :class="{
        'sub-menu-item': isInSubMenu,
        active: isActive,
      }"
    >
      <router-link v-if="'route' in item" :to="item.route!">
        <ReuseTemplate
      /></router-link>
      <span v-else-if="'onClick' in item" @click="item.onClick">
        <ReuseTemplate />
      </span>
      <span v-else :v-b-toggle="item.title">
        <ReuseTemplate />
      </span>
    </BNavItem>
  </BNavbarNav>
</template>
<script setup lang="ts">
import type { NavigationItem } from "./NavigationMenu.vue";
import { createReusableTemplate } from "@vueuse/core";

const { item } = defineProps<{
  item: NavigationItem;
  isInSubMenu?: boolean;
}>();

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

const route = useRoute();
const router = useRouter();

const isActive = computed(() =>
  "route" in item
    ? router
        .getRoutes()
        .filter(
          (r) =>
            r.name !== "/[...all]" &&
            (r.name === item.route.name ||
              r.aliasOf?.name === item.route.name ||
              r.path.startsWith(
                item.route.path.match(/^\/[^\/]+/)?.[0] ?? "_",
              )),
        )
        .map((r) => r.name)
        .includes(route.name)
    : false,
);
</script>

<style scoped lang="scss">
:deep(a) {
  width: 100%;
}
li {
  line-height: 25px;
  padding: 0 10px;
  cursor: pointer;

  &:hover {
    background-color: #020203;
  }

  &.active,
  &.active a {
    color: #c88964 !important;
  }

  a,
  span {
    display: flex;
    align-items: center;
    text-decoration: none !important;
    color: white !important;
    border-bottom: 0 !important;
    margin-left: 1.5rem;

    svg {
      position: absolute;
      left: 1rem;
    }
  }

  &.sub-menu-item {
    background-color: rgb(24, 28, 32);
    border: none;
    border-bottom: 1px solid #23282e;
    padding-left: 1.5rem;
    margin-left: 0;

    @media (max-width: 767px) {
      background-color: rgba(24, 28, 32, 0.9);
    }

    svg {
      left: 2rem;
      width: 1rem;
    }
  }

  &:hover {
    position: relative;
    background-color: rgba(79, 91, 105, 0.9);
    -webkit-transition: all 0.1s ease;
    -moz-transition: all 0.1s ease;
    -o-transition: all 0.1s ease;
    -ms-transition: all 0.1s ease;
    transition: all 0.1s ease;

    &:before {
      content: "";
      position: absolute;
      left: 0;
      height: 100%;

      border-left: 3px solid rgb(200, 137, 100) !important;
    }
  }

  &.empty {
    cursor: default;
  }
}
</style>