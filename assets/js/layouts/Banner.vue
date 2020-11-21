<template>
  <div
    id="logo_zone1"
    :class="classes"
  >
    <a :href="username ? '/collection/show' : '/'">
      <img
        :src="`${imagePath}/logo_small.png`"
        alt="DucksManager"
      >
    </a>
  </div>
</template>

<script>
export default {
  name: "Banner",

  props: {
    classes: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    imagePath: () => window.imagePath,
    username: () => window.username
  }
}
</script>

<style scoped lang="scss">
#logo_zone1 {
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: rgb(200, 137, 100) !important;
  height: 180px;

  &.small-image {
    img {
      height: 50px;
      top: 0;
      position: fixed;
      right: 10px;
    }
  }

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}
</style>