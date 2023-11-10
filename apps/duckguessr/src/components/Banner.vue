<template>
  <div
    id="logo-zone"
    class="position-absolute d-flex align-items-center flex-column align-items-center"
  >
    <a href="/">
      <b-img src="/logo.png" />
      <div class="small">
        <a href="https://ducksmanager.net">{{ t("by DucksManager") }}</a>
      </div>
    </a>
  </div>
</template>
<script lang="ts" setup>
const { t } = useI18n();
</script>
<style lang="scss">
#logo-zone {
  width: 100%;
  height: 100px;
  justify-content: center;
  padding: 2rem 6rem;

  a {
    z-index: 2;
    max-width: 100%;
    border-bottom: 0 !important;

    img {
      max-width: 100%;
      max-height: 70px;
    }
  }

  @media (min-width: 992px) {
    height: 110px;
    width: calc(100% - 320px);
    right: 0;
  }
}
</style>
