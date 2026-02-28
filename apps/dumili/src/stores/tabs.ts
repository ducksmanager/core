export const tabs = defineStore("tabs", () => {
  const { t: $t } = useI18n();

  const tabNames = computed(() => [
    { id: "pageGallery", label: $t("Galerie des pages") },
    { id: "book", label: $t("Livre") },
    { id: "textEditor", label: $t("Editeur de texte") },
  ]);

  const activeTabIndex = ref(0);

  return {
    tabNames,
    activeTabIndex,
  };
});
