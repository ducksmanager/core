<template>
  <li :class="{'non-empty': true, 'no-icon': !icon, active }">
    <a :href="getLink(path)">
      <i :class="{[icon]: true}" />
      <slot />
    </a>
  </li>
</template>

<script>
export default {
  name: "NavigationItem",
  props: {
    path: {type: String, required: true},
    icon: {type: String, default: null}
  },

  computed: {
    active() {
      return !this.path.split('/')
        .find(pathPart =>
          !window.location.pathname.split('/').includes(pathPart)
        )
    }
  },

  methods: {
    getLink: path => path.indexOf('/') === 0 ? path : `/?action=${path}`
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