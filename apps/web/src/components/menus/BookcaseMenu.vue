<template>
  <Menu :title="$t('Ma bibliothèque')" :items="items" />
</template>

<script setup lang="ts">
const { t: $t } = useI18n();
const items = [
  { route: "/bookcase/show/[username]", text: $t("Ma bibliothèque") },
  { route: "/bookcase/options", text: $t("Options de la bibliothèque") },
  { route: "/bookcase/contributors", text: $t("Contributeurs") },
] as const;
</script>