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
import Menu from "./Menu";
import { useI18n } from "vue-i18n";
import { computed, onMounted, useAttrs, defineAsyncComponent } from "vue";
const { collection } = require("../stores/collection");

const props = defineProps({
  tab: {
    type: String,
    required: true,
  },
});
const component = computed(() =>
    defineAsyncComponent(() => import(`./collection/${props.tab}`))
  ),
  attrs = useAttrs(),
  { t: $t } = useI18n(),
  items = computed(() => [
    {
      path: "/show",
      text:
        total.value == null
          ? $t("Mes numéros")
          : $t("Mes numéros ({0})", [total.value]),
    },
    {
      path: "/duplicates",
      text:
        totalUniqueIssues.value == null
          ? $t("Mes numéros en double")
          : $t("Mes numéros en double ({0})", [
              total.value - totalUniqueIssues.value,
            ]),
    },
    {
      path: "/subscriptions",
      text:
        subscriptions.value == null
          ? $t("Mes abonnements")
          : $t("Mes abonnements ({0})", [subscriptions.value.length]),
    },
    { path: "/account", text: $t("Mon compte") },
  ]),
  subscriptions = computed(() => collection().subscriptions),
  total = computed(() => collection().total),
  totalUniqueIssues = computed(() => collection().totalUniqueIssues),
  attrsWithoutTab = computed(() =>
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
