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
import { storeToRefs } from "pinia";

import { suggestions } from "~/stores/suggestions";
import { GET__cover_id__download__$coverId } from "~api-routes";

const { acceptSuggestion, rejectAllSuggestions } = suggestions();
const { hasPendingIssueSuggestions, issueSuggestions } = storeToRefs(
  suggestions()
);

const selectedExistingCoverIssuecode = ref(null as string | null);

const issueSuggestionsWithUrls = computed(() =>
  suggestions()
    .issueSuggestions.filter(({ data }) => data.coverId)
    .map((issueSuggestion) => ({
      ...issueSuggestion,
      url:
        import.meta.env.VITE_DM_API_URL +
        GET__cover_id__download__$coverId.url.replace(
          ":coverId",
          String(issueSuggestion.data.coverId)
        ),
    }))
);
const images = computed(() =>
  issueSuggestionsWithUrls.value.map(({ url, data }) => ({
    text: `${data.publicationcode} ${data.issuenumber}`,
    url,
  }))
);

const coverUrlToIssuecode = (url: string): string =>
  issueSuggestionsWithUrls.value.find(
    ({ url: issueSuggestionUrl }) => issueSuggestionUrl === url
  )?.data.issuecode || "";

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
