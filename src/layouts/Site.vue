<template>
  <component :is="pageComponent" v-if="isBare" v-bind="attrsWithoutId" />
  <div v-else :class="{ full: !isBare }">
    <LeftPanel />
    <SwitchLocale />
    <Banner :classes="{ 'd-none d-md-flex': true }" />
    <div id="logo_zone2">
      <h2 v-if="innerTitle">
        {{ innerTitle }}
      </h2>
      <component :is="pageComponent" v-bind="attrsWithoutId" />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted, useAttrs } from "vue";

const { bare, page } = defineProps({
  page: { type: String, required: true },
  title: { type: String, default: null },
  innerTitle: { type: String, default: null },
  bare: { type: String, default: "0" },
});
const attrs = useAttrs();
const pageComponent = $computed(() =>
  defineAsyncComponent(() => import(`./${page}`))
);
const isBare = $computed(() => bare === "1");
const attrsWithoutId = $computed(() =>
  Object.keys(attrs)
    .filter((attrKey) => attrKey !== "id")
    .reduce((acc, attrKey) => ({ ...acc, [attrKey]: attrs[attrKey] }), {})
);

onMounted(() => {
  if (isBare) document.body.className = "bare";
});
</script>

<style scoped lang="scss">
.full {
  * {
    color: white;
    background-color: rgb(61, 75, 95) !important;
  }
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
