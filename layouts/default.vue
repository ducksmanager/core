<template>
  <div>
    <LeftPanel />
    <SwitchLocale />
    <Banner :classes="{ 'd-none d-md-flex': true }" />
    <div id="logo_zone2">
      <h2 v-if="$slots['inner-title']">
        <slot name="inner-title" />
      </h2>
      <slot />
    </div>
    <Footer />
  </div>
</template>

<script setup>
const slots = useSlots();
useHead({
  title: slots.title || "DucksManager",
});
</script>

<style scoped lang="scss">
* {
  color: white;
  background-color: rgb(61, 75, 95) !important;
}

#logo_zone2 {
  padding: 45px 20px 20px 20px;
  vertical-align: top;
  min-height: calc(100vh - 105px);
}

@media (max-width: 767px) {
  #logo_zone2 {
    background: none;
    min-height: calc(100vh - 125px);
  }
}
</style>
