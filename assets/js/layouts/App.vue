<template>
  <component :is="component" v-bind="props" />
</template>

<script setup>
import { defineAsyncComponent, onMounted } from "vue";

import { l10n } from "../stores/l10n";
let componentName = $ref(null);

const component = $computed(() =>
    componentName
      ? defineAsyncComponent(() => import(`./${componentName}`))
      : null
  ),
  props = $ref({});

onMounted(() => {
  for (const { name, value } of document.getElementById("app").attributes) {
    if (name === "component") {
      componentName = value;
    } else {
      props[name] = value;
    }
  }
  l10n().loadL10n();
});
</script>

<style scoped>

</style>
