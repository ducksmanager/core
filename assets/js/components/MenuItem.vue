<template>
  <b-nav-item
    :href="active ? '#' : $r(rootPath+path)"
    :active="active"
  >
    <span v-html="text" />
  </b-nav-item>
</template>
<script>
import {BNavItem} from "bootstrap-vue-3";
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "MenuItem",

  components: {
    BNavItem
  },


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

  methods: {
    ...mapActions(l10n, ["$r"]),
  }
}
</script>

<style lang="scss">
a.nav-link {
  &.active {
    color: black !important;
  }
}
</style>
