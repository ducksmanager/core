<template>
  <Menu :title="$t('Statistiques de ma collection')" :items="items" />
</template>

<script setup lang="ts">
const { t: $t } = useI18n();
const items = [
  { route: "/stats/general", text: $t("Général") },
  { route: "/stats/publications", text: $t("Publications") },
  { route: "/stats/possessions", text: $t("Possessions") },
  { route: "/stats/conditions", text: $t("États des numéros") },
  { route: "/stats/purchases", text: $t("Achats") },
  { route: "/stats/authors", text: $t("Auteurs") },
] as const;
</script>