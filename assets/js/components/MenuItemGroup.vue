<template>
  <span>
    <li
      data-toggle="collapse"
      :data-target="`#${path}`"
      :class="{collapsed: true, active }"
    >
      <a href="#"><i :class="{ [icon]: true }" /><slot name="text" /><span class="arrow" /></a>
    </li>
    <ul
      :id="path"
      class="sub-menu collapse in show"
    >
      <slot name="items" />
    </ul>
  </span>
</template>

<script>
export default {
  name: "MenuItemGroup",
  props: {
    path: {type: String, required: true},
    icon: {type: String, required: true}
  },
  computed: {
    active() { return window.location.pathname.split('/').includes(this.path) }
  },
  methods: {}
}
</script>

<style scoped/>