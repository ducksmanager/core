<template>
  <b-nav-item
    :href="active ? '#' : $r(rootPath+path)"
    :active="active"
  >
    <span v-html="text" />
  </b-nav-item>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "MenuItem",

  mixins: [l10nMixin],

  props: {
    rootPath: {
      type: String,
      default: '/'
    },
    path: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },

  computed: {
    active() {
      return !this.$r(this.rootPath + this.path).split('/')
        .find(pathPart =>
          !window.location.pathname.split('/').includes(pathPart)
        )
    }
  },
}
</script>

<style lang="scss">
a.nav-link {
  &.active {
    color: black !important;
  }
}
</style>