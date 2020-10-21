<template>
  <div>
    <h3>
      {{ title }}
    </h3>
    <b-nav tabs>
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

export default {
  name: "Menu",
  components: {MenuItem},
  props: {
    title: {
      type: String,
      required: true
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