<template>
  <ul class="menu-content collapse show pb-md-3">
    <NavigationItem :item="menu" :is-in-sub-menu="false" />
    <b-collapse :id="menu.title" :model-value="true" class="mb-md-2">
      <ul class="sub-menu">
        <NavigationItem
          v-for="item in menu.items"
          :key="item.title"
          :item="item"
          :is-in-sub-menu="true"
        />
      </ul>
    </b-collapse>
  </ul>
</template>

<script lang="ts">
export type NavigationItem = {
  title: string;
  icon?: FunctionalComponent<SVGAttributes>;
} & (
  | {
      route: RouteLocationResolved;
    }
  | {
      onClick: () => void;
    }
  | object
);
</script>

<script setup lang="ts">
import { RouteLocationResolved } from "vue-router";
import NavigationItem from "./NavigationItem.vue";
import { FunctionalComponent, SVGAttributes } from "vue";

type Menu = {
  title: string;
  icon: FunctionalComponent<SVGAttributes>;
  items: readonly NavigationItem[];
};

defineProps<{
  menu: Menu;
}>();
</script>


<style lang="scss" scoped>
.b-custom {
  display: inline-block;
  background-repeat: no-repeat;
  height: 12px;
  background-size: 12px;
  width: 12px;
  background-position: bottom;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;

  @media (max-width: 767px) {
    background-color: rgba(46, 53, 61, 0.9);
  }

  &.active {
    border-left: 3px solid #c88964;
    background-color: #4f5b69;
  }

  &.active > a > *,
  a.router-link-active {
    color: #c88964 !important;
  }
}
</style>
