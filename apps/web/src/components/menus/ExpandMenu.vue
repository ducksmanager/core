<template>
  <Menu :title="$t('Agrandir ma collection')" :items="items" />
</template>
<script setup lang="ts">
const { t: $t } = useI18n();
const items = [
  { route: "/expand/suggestions", text: $t("Suggestions") },
  {
    route: "/expand/marketplace",
    text: $t("Marketplace"),
    isNew: true,
  },
] as const;
</script>
