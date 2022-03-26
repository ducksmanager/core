<template>
  <div
    id="logo-zone"
    class="position-absolute p-2 px-5 d-flex align-items-center flex-column align-items-center"
  >
    <a href="/">
      <b-img src="/logo.png" />
    </a>
    <small>by DucksManager</small>
  </div>
</template>
<script lang="ts">
export default {
  name: 'Banner',
}
</script>
<style lang="scss">
#logo-zone {
  width: 100%;

  a {
    max-width: 100%;

    img {
      max-width: 100%;
      max-height: 70px;
    }
  }

  @media (min-width: 767px) {
    height: 110px;
    width: calc(100% - 320px);
  }
}
</style>
