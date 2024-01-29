<template>
  <span
    class="watch wrapper d-inline-flex align-items-center justify-content-center"
    :class="{
      'constant-width': constantWidth,
    }"
  >
    <b-button
      pill
      :variant="isWatched ? 'secondary' : 'outline-secondary'"
      class="d-inline-flex xl py-0 px-1 ms-2 me-2"
      :class="{
        'soft-disabled': isPublicationWatchedButNotIssueNumber,
        disabled: !publicationcode,
      }"
      :title="buttonTooltipText"
      @click="
        !isPublicationWatchedButNotIssueNumber && toggleWatchedPublication()
      "
    >
      <i-bi-eyeglasses
        :variant="isWatched ? 'light' : 'secondary'"
        class="mx-1"
      />
      <span v-if="isWatched" class="text-light">{{ $t("Surveillé") }}</span>
      <span v-else class="text-tertiary on-icon-hover">{{
        $t("Surveiller")
      }}</span>
    </b-button></span
  >
</template>
<script setup lang="ts">
const {
  issuenumber = null,
  publicationcode = null,
  constantWidth = false,
} = defineProps<{
  publicationcode?: string;
  issuenumber?: string;
  constantWidth?: boolean;
}>();

const { t: $t } = useI18n();

const { loadWatchedPublicationsWithSales, updateWatchedPublicationsWithSales } =
  collection();
const { watchedPublicationsWithSales } = storeToRefs(collection());

const key = $computed(
  () => publicationcode + (issuenumber ? ` ${issuenumber}` : ""),
);

const isWatched = $computed(() =>
  watchedPublicationsWithSales.value?.includes(key),
);
const isPublicationWatchedButNotIssueNumber = $computed(
  () =>
    !isWatched &&
    publicationcode &&
    watchedPublicationsWithSales.value?.includes(publicationcode),
);
const buttonTooltipText = $computed(() =>
  $t(
    isWatched
      ? issuenumber === null
        ? "Cliquez ici pour ne plus voir les numéros que vous ne possédez pas de ce magazine qui sont en vente"
        : "Cliquez ici pour ne plus voir les propositions de vente de ce numéro"
      : issuenumber === null
        ? "Cliquez ici pour voir les numéros que vous ne possédez pas de ce magazine qui sont en vente !"
        : isPublicationWatchedButNotIssueNumber
          ? "Vous surveillez déjà tous les numéros de ce magazine. Cliquez sur 'Surveillé' en face du titre du magazine pour ne surveiller que certains numéros de ce magazine."
          : "Cliquez ici pour voir les propositions de vente de ce numéro !",
  ),
);

if (publicationcode) {
  loadWatchedPublicationsWithSales();
}

const toggleArrayItem = (a: string[], v: string) => {
  const i = a.indexOf(v);
  if (i === -1) a.push(v);
  else a.splice(i, 1);
};

const toggleWatchedPublication = async () => {
  if (watchedPublicationsWithSales.value) {
    toggleArrayItem(watchedPublicationsWithSales.value, key);
    await updateWatchedPublicationsWithSales();
  }
};
</script>
<style scoped lang="scss">
.wrapper {
  &.constant-width {
    width: 90px;
  }
}
.btn {
  line-height: 15px;
  vertical-align: super;
  margin-right: 2px;

  &:focus {
    box-shadow: none;
  }

  &.soft-disabled {
    cursor: not-allowed;
  }

  &:not(.soft-disabled):hover,
  &:not(.disabled):hover {
    color: white !important;

    .on-icon-hover {
      display: inline;
    }
  }

  .on-icon-hover {
    display: none;
  }
}
</style>
