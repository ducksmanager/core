<template>
  <div>
    <NuxtLayout name="default">
      <template #title>{{ $t("Collection") }}</template>
      <template #inner-title>{{ $t("Collection") }}</template>
      <Menu
        :title="$t('Gérer ma collection')"
        :root-path="'/collection'"
        :default-path="'/show'"
        :items="items"
      />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

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

onMounted(() => {
  collection().loadSubscriptions();
});
</script>

<style scoped lang="scss">
</style>
