<template>
  <div>
    <Menu
      :title="$t('Gérer ma collection')"
      :root-path="'/collection'"
      :default-path="'/show'"
      :items="items"
    />
    <component :is="component" v-bind="attrsWithoutTab" />
  </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted, useAttrs } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "../../../stores/collection";
import Menu from "./Menu";

const props = defineProps({
  tab: {
    type: String,
    required: true,
  },
});
const component = $computed(() =>
  defineAsyncComponent(() =>
    import(
      `./assets/js/pages/collection/${
        props.tab[0].toUpperCase() + props.tab.substring(1)
      }`
    )
  )
);
const attrs = useAttrs();
const { t: $t } = useI18n();
const items = $computed(() => [
  {
    path: "/show",
    text: total == null ? $t("Mes numéros") : $t("Mes numéros ({0})", [total]),
  },
  {
    path: "/duplicates",
    text:
      totalUniqueIssues == null
        ? $t("Mes numéros en double")
        : $t("Mes numéros en double ({0})", [total - totalUniqueIssues]),
  },
  {
    path: "/subscriptions",
    text:
      subscriptions == null
        ? $t("Mes abonnements")
        : $t("Mes abonnements ({0})", [subscriptions.length]),
  },
  { path: "/account", text: $t("Mon compte") },
]);
const subscriptions = $computed(() => collection().subscriptions);
const total = $computed(() => collection().total);
const totalUniqueIssues = $computed(() => collection().totalUniqueIssues);
const attrsWithoutTab = $computed(() =>
  Object.keys(attrs)
    .filter((attrKey) => attrKey !== "tab")
    .reduce((acc, attrKey) => ({ ...acc, [attrKey]: attrs[attrKey] }), {})
);
const loadSubscriptions = collection().loadSubscriptions;

onMounted(() => {
  loadSubscriptions();
});
</script>

<style scoped lang="scss">
</style>
