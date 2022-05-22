<template>
  <div
    id="logo-zone"
    class="position-absolute p-2 px-5 d-flex align-items-center flex-column align-items-center"
  >
    <a class="px-5" href="/">
      <b-img src="/logo.png" />
      <div class="small">by DucksManager</div>
    </a>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="scss">
#logo-zone {
  width: 100%;
  height: 100px;
  justify-content: center;

  a {
    z-index: 2;
    max-width: 100%;
    border-bottom: 0 !important;

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
