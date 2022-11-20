<template>
  <span
    class="wrapper d-inline-flex align-items-center justify-content-center"
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
      <b-icon-eyeglasses
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
<script setup>
import { BIconEyeglasses } from "bootstrap-icons-vue";
import { BButton } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

const props = defineProps({
  publicationcode: {
    type: String,
    default: null,
  },
  issuenumber: {
    type: String,
    default: null,
  },
  constantWidth: {
    type: Boolean,
    default: false,
  },
});

const { t: $t } = useI18n();

const watchedPublicationsWithSales = $computed(
  () => collection().watchedPublicationsWithSales
);

const key = $computed(
  () =>
    props.publicationcode + (props.issuenumber ? ` ${props.issuenumber}` : "")
);

const isWatched = $computed(() => watchedPublicationsWithSales?.includes(key));
const isPublicationWatchedButNotIssueNumber = $computed(
  () =>
    !isWatched && watchedPublicationsWithSales?.includes(props.publicationcode)
);
const buttonTooltipText = $computed(() =>
  $t(
    isWatched
      ? props.issuenumber === null
        ? "Cliquez ici pour ne plus voir les numéros que vous ne possédez pas de ce magazine qui sont en vente"
        : "Cliquez ici pour ne plus voir les propositions de vente de ce numéro"
      : props.issuenumber === null
      ? "Cliquez ici pour voir les numéros que vous ne possédez pas de ce magazine qui sont en vente !"
      : isPublicationWatchedButNotIssueNumber
      ? "Vous surveillez déjà tous les numéros de ce magazine. Cliquez sur 'Surveillé' en face du titre du magazine pour ne surveiller que certains numéros de ce magazine."
      : "Cliquez ici pour voir les propositions de vente de ce numéro !"
  )
);

onMounted(() => {
  if (props.publicationcode) {
    collection().loadWatchedPublicationsWithSales();
  }
});

const toggleArrayItem = (a, v) => {
  const i = a.indexOf(v);
  if (i === -1) a.push(v);
  else a.splice(i, 1);
};

const toggleWatchedPublication = async () => {
  toggleArrayItem(collection().watchedPublicationsWithSales, key);
  await collection().updateWatchedPublicationsWithSales();
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
