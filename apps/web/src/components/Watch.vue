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
        'soft-disabled': isPublicationWatchedButNotIssuecode,
        disabled: isIssue === undefined,
      }"
      :title="buttonTooltipText"
      @click="!isPublicationWatchedButNotIssuecode && emit('toggled')"
    >
      <i-bi-eyeglasses
        :variant="isWatched ? 'light' : 'secondary'"
        class="mx-1"
      />
      <span v-if="isWatched" class="text-light">{{ $t("Surveillé") }}</span>
      <span
        v-else-if="!isPublicationWatchedButNotIssuecode"
        class="text-tertiary on-icon-hover"
        >{{ $t("Surveiller") }}</span
      >
    </b-button></span
  >
</template>
<script setup lang="ts">
const {
  isWatched = undefined,
  isPublicationWatched = undefined,
  isIssue = undefined,
  constantWidth = false,
} = defineProps<{
  isWatched?: boolean;
  isPublicationWatched?: boolean;
  isIssue?: boolean;
  constantWidth?: boolean;
}>();

const { t: $t } = useI18n();

const emit = defineEmits<{
  (e: "toggled"): void;
}>();

const isPublicationWatchedButNotIssuecode = $computed(
  () => isPublicationWatched && isIssue,
);
const buttonTooltipText = $computed(() =>
  $t(
    isWatched
      ? !isIssue
        ? "Cliquez ici pour ne plus voir les numéros que vous ne possédez pas de ce magazine qui sont en vente"
        : "Cliquez ici pour ne plus voir les propositions de vente de ce numéro"
      : !isIssue
        ? "Cliquez ici pour voir les numéros que vous ne possédez pas de ce magazine qui sont en vente !"
        : isPublicationWatchedButNotIssuecode
          ? "Vous surveillez déjà tous les numéros de ce magazine. Cliquez sur 'Surveillé' en face du titre du magazine pour ne surveiller que certains numéros de ce magazine."
          : "Cliquez ici pour surveiller les propositions de vente de ce numéro !",
  ),
);
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

  &:hover {
    color: white !important;

    .on-icon-hover {
      display: inline;
    }
  }

  &.soft-disabled:hover,
  &.disabled:hover {
    background-color: var(--bs-btn-bg) !important;
    color: var(--bs-btn-color) !important;
  }

  .on-icon-hover {
    display: none;
  }
}
</style>
