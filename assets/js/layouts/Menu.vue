<template>
  <div>
    <h3 v-if="title">
      {{ title }}
    </h3>
    <b-nav
      v-if="items.length"
      tabs
    >
      <MenuItem
        v-for="item in items"
        :key="JSON.stringify(item)"
        :root-path="rootPath"
        :path="item.path"
        :text="item.text"
      />
    </b-nav>
  </div>
</template>

<script>
import MenuItem from "../components/MenuItem";
import {BNav} from "bootstrap-vue-3";

export default {
  name: "Menu",
  components: {MenuItem, BNav},
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
  }
}
</script>

<style scoped>
.nav {
  margin: 20px 0;
}
</style>
