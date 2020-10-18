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
  name: "MenuItem",
  props: {
    path: {type: String, required: true},
    icon: {type: String, default: null}
  },

  computed: {
    active() { return window.location.pathname.split('/').includes(this.path) }
  },

  methods: {
    getLink: path => path.indexOf('/') === 0 ? path : `/?action=${path}`
  }
}
</script>

<style scoped>

</style>