<template>
  <li :class="{'non-empty': true, 'no-icon': !icon, active }">
    <a :href="$r(path)">
      <i :class="{[icon]: true}" />
      <slot />
    </a>
  </li>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "NavigationItem",
  mixins: [l10nMixin],
  props: {
    path: {type: String, required: true},
    icon: {type: String, default: null}
  },

  computed: {
    active() {
      return !this.path.split('/')
        .find(pathPart =>
          !window.location.pathname.split('/').includes(pathPart)
        ) && !/bookcase\/show\/.+$/.test(window.location.pathname)
    }
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