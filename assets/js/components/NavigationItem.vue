<template>
  <li :class="{'non-empty': true, 'no-icon': !icon, active }">
    <a :href="$r(path)">
      <i :class="{[icon]: true}" />
      <slot />
    </a>
  </li>
</template>

<script>
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "NavigationItem",
  props: {
    path: {type: String, required: true},
    icon: {type: String, default: null}
  },

  computed: {
    active() {
      return !this.$r(this.path).split('/')
        .find(pathPart =>
          !window.location.pathname.split('/').includes(pathPart)
        ) && !/(bibliotheque\/afficher)|(bookcase\/show\/).+$/.test(window.location.pathname)
    }
  },
  methods: {
    ...mapActions(l10n, ["$r"]),
  }
}
</script>

<style scoped lang="scss">
a {
  &:hover {
    border: 0 !important;
  }
}
</style>
