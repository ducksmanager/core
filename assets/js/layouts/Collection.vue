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

import { user } from "../composables/global";
import { collection } from "../stores/collection";
import Menu from "./Menu";

const { tab } = defineProps({
  tab: {
    type: String,
    required: true,
  },
});
const { username } = user();

const component = $computed(() =>
    defineAsyncComponent(() =>
      import(`./collection/${tab[0].toUpperCase() + tab.substring(1)}`)
    )
  ),
  attrs = useAttrs(),
  { t: $t } = useI18n(),
  items = $computed(() => [
    {
      path: "/show",
      text:
        total == null ? $t("Mes numéros") : $t("Mes numéros ({0})", [total]),
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
    { path: "/account", text: $t("Mon compte"), disabled: username === "demo" },
  ]),
  subscriptions = $computed(() => collection().subscriptions),
  total = $computed(() => collection().total),
  totalUniqueIssues = $computed(() => collection().totalUniqueIssues),
  attrsWithoutTab = $computed(() =>
    Object.keys(attrs)
      .filter((attrKey) => attrKey !== "tab")
      .reduce((acc, attrKey) => ({ ...acc, [attrKey]: attrs[attrKey] }), {})
  ),
  loadSubscriptions = collection().loadSubscriptions;

onMounted(() => {
  loadSubscriptions();
});
</script>

<style scoped lang="scss">
</style>
