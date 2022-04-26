<template>
  <div>
    <h3 v-if="title">
      {{ title }}
    </h3>
    <b-tabs
      v-if="items.length"
      class="my-4"
    >
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

<script>
import {BTab, BTabs} from "bootstrap-vue-3";
import {mapActions} from "pinia";
import {l10n} from "../stores/l10n";

export default {
  name: "Menu",
  components: {BTab, BTabs},
  props: {
    title: {
      type: String,
      default: null
    },
    rootPath: {
      type: String,
      default: '/'
    },
    items: {
      type: Array,
      required: true
    }
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    isActive({path}) {
      return window.location.pathname === this.$r(this.rootPath + path)
    },
    onTabClick(item) {
      window.location.replace(this.isActive(item) ? '#' : this.$r(this.rootPath+item.path))
    }
  }
}
</script>

<style scoped lang="scss">
:deep(.nav-link) {
  color: darkgrey !important;
  &.active {
    color: black !important;
  }
}
</style>
