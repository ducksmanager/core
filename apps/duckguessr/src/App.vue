<template>
  <b-container id="main" fluid>
    <b-row>
      <b-col cols="2" class="p-0"><medals-and-login /></b-col
      ><b-col cols="1" /><b-col cols="8"><banner /></b-col
      ><b-col cols="1" class="d-flex align-items-center justify-content-center"
        ><language-switch-dropdown /></b-col
    ></b-row>
    <b-row>
      <b-col cols="2"><duckguessr-menu /></b-col
      ><b-col cols="10"><router-view /></b-col></b-row
  ></b-container>
</template>

<script lang="ts" setup>
import { userStore } from "~/stores/user";

const route = useRoute();
const i18n = useI18n();

onMounted(() => {
  userStore().login();
});
watch(
  () => route.path,
  () => {
    const storedLocale = window.localStorage?.getItem("locale");
    if (storedLocale) {
      i18n.locale.value = storedLocale;
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
<style lang="scss" scoped>
.row {
  $border-size: 3px;

  &:nth-child(1) {
    border-bottom: $border-size solid white;
  }
  &:nth-child(2) {
    border-top: $border-size solid white;
    flex-grow: 1;
  }

  > [class*="col-"] {
    padding: 0;

    &:nth-child(1) {
      border-right: $border-size solid white;
    }
    &:nth-child(2) {
      border-left: $border-size solid white;
    }
  }
}

#main.container-fluid {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
