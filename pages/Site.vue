<template>
  <div v-if="l10nRoutes">
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
import { defineAsyncComponent, useAttrs } from "vue";

import { l10n } from "../stores/l10n";
import Banner from "./Banner";
import Footer from "./Footer";
import LeftPanel from "./LeftPanel";
import SwitchLocale from "./SwitchLocale";

const props = defineProps({
    page: { type: String, required: true },
    title: { type: String, default: null },
    innerTitle: { type: String, default: null },
  }),
  attrs = useAttrs(),
  pageComponent = $computed(() =>
    defineAsyncComponent(() => import(`./${props.page}`))
  ),
  l10nRoutes = $computed(() => l10n().l10nRoutes),
  attrsWithoutId = $computed(() =>
    Object.keys(attrs)
      .filter((attrKey) => attrKey !== "id")
      .reduce((acc, attrKey) => ({ ...acc, [attrKey]: attrs[attrKey] }), {})
  );
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
