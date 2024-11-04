export const tabs = defineStore("tabs", () => {
  const { t: $t } = useI18n();

  const tabNames = {
    book: $t("Livre"),
    pageGallery: $t("Galerie des pages"),
    textEditor: $t("Editeur de texte"),
  } as const;

  const activeTab = ref<keyof typeof tabNames>("book");

  return {
    tabNames,
    activeTab,
  };
});
