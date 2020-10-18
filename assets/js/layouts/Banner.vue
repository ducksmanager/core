<template>
  <div id="logo_zone1">
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

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}

@media (max-width: 767px) {
  #logo_zone1 {
    display: none;
  }
}
</style>