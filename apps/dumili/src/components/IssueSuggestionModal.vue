<template>
  <b-modal
    :model-value="hasPendingIssueSuggestions"
    title="Dumili a de nouvelles suggestions !"
    align="center"
    centered
    :ok-disabled="selectedExistingCoverIssuecode === null"
    cancel-title="Annuler"
    @ok.prevent="acceptIssueSuggestion(selectedExistingCoverIssuecode!)"
    @cancel.prevent="rejectAllIssueSuggestions"
  >
    <div class="m-3">
      Dumili a trouvé des couvertures existantes ressemblant à la vôtre.
      Sélectionnez la couverture qui ressemble le plus à la vôtre.<br />Si
      aucune ne ressemble,cliquez sur "Annuler".
    </div>
    <Gallery
      v-slot="{ issuecode }"
      :images="images"
      selectable
      @selected="
        (url: string) => (selectedExistingCoverIssuecode = coverUrlToIssuecode(url))
      "
      ><Issue
        :publicationcode="getPublicationcodeFromIssuecode(issuecode)"
        :issuenumber="getIssuenumberFromIssuecode(issuecode)"
    /></Gallery>
  </b-modal>
</template>

<script lang="ts" setup>
import { IssueSuggestion, suggestions } from "~/stores/suggestions";
import { composables as dmComposables } from "~web";

const { coverIdServices } = dmComposables.useDmSocket;

const { acceptSuggestion, rejectAllSuggestions } = suggestions();
const { hasPendingIssueSuggestions, issueSuggestions } = storeToRefs(
  suggestions()
);

const issueSuggestionsWithUrls = ref<
  (IssueSuggestion["data"] & { url: string })[]
>([]);

const selectedExistingCoverIssuecode = ref<string | null>(null);

const validIssueSuggestions = computed(() =>
  issueSuggestions.value.filter(({ data }) => data.coverId)
);

watch(
  () => validIssueSuggestions.value,
  async (newValue) => {
    if (newValue.length) {
      issueSuggestionsWithUrls.value = (
        await Promise.all(
          newValue.map((issueSuggestion) =>
            coverIdServices.downloadCover(issueSuggestion.data.coverId!)
          )
        )
      ).map((url, i) => ({
        ...newValue[i].data,
        url: url as string,
      }));
    }
  },
  { immediate: true }
);

const images = computed(() =>
  issueSuggestionsWithUrls.value.map(({ url, ...data }) => ({
    text: `${data.publicationcode} ${data.issuenumber}`,
    url,
  }))
);

const coverUrlToIssuecode = (url: string): string =>
  issueSuggestionsWithUrls.value.find(
    ({ url: issueSuggestionUrl }) => issueSuggestionUrl === url
  )?.issuecode || "";

const getPublicationcodeFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[0];
const getIssuenumberFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[1];

const acceptIssueSuggestion = (issuecode: string) => {
  acceptSuggestion(
    issueSuggestions.value,
    (suggestion) => suggestion.data.issuecode === issuecode
  );
  selectedExistingCoverIssuecode.value = null;
};

const rejectAllIssueSuggestions = () => {
  rejectAllSuggestions(issueSuggestions.value);
};
</script>
