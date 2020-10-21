<template>
  <li
    data-toggle="collapse"
    :data-target="`#${path}`"
    :class="{collapsed: true, active }"
  >
    <a href="#"><i :class="{ [icon]: true }" />
      <slot name="text" />
      <span class="arrow" /></a>
    <ul
      :id="path"
      class="sub-menu collapse in show"
    >
      <slot name="items" />
    </ul>
  </li>
</template>

<script>
export default {
  name: "NavigationItemGroup",
  props: {
    path: {type: String, required: true},
    icon: {type: String, required: true}
  },
  computed: {
    active() {
      return window.location.pathname.split('/').includes(this.path)
    }
  },
  methods: {}
}
</script>

<style scoped/>