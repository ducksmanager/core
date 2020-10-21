<template>
  <b-nav-item
    :href="active ? '#' : rootPath+path"
    :active="active"
  >
    {{ text }}
  </b-nav-item>
</template>
<script>
export default {
  name: "MenuItem",

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
      return !(this.rootPath + this.path).split('/')
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