<template>
  <component :is="component" v-bind="props" />
</template>

<script setup>
import { computed, defineAsyncComponent, ref, onMounted } from "vue";
import { l10n } from "../stores/l10n";
const componentName = ref(null),
  component = computed(() =>
    componentName.value
      ? defineAsyncComponent(() => import(`./${componentName.value}`))
      : null
  ),
  props = ref({});

onMounted(() => {
  for (const { name, value } of document.getElementById("app").attributes) {
    if (name === "component") {
      componentName.value = value;
    } else {
      props.value[name] = value;
    }
  }
  l10n().loadL10n();
});
</script>

<style scoped>

</style>
