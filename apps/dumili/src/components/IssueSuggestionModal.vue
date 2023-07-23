<template>
  <b-modal
    :model-value="hasPendingIssueSuggestions"
    title="Dumili a de nouvelles suggestions !"
    align="center"
    centered
    :ok-disabled="selectedExistingCoverIssuecode === null"
    @ok.prevent="acceptIssueSuggestion(selectedExistingCoverIssuecode!)"
    @cancel.prevent="rejectAllIssueSuggestions"
    cancel-title="Annuler"
  >
    <div class="m-3">
      Dumili a trouvé des couvertures existantes ressemblant à la vôtre.
      Sélectionnez la couverture qui ressemble le plus à la vôtre.<br />Si
      aucune ne ressemble,cliquez sur "Annuler".
    </div>
    <Gallery
      :images="images"
      selectable
      @selected="
        (url) => (selectedExistingCoverIssuecode = coverUrlToIssuecode(url))
      "
      v-slot="{ issuecode }"
      ><Issue
        :publicationcode="getPublicationcodeFromIssuecode(issuecode)"
        :issuenumber="getIssuenumberFromIssuecode(issuecode)"
    /></Gallery>
  </b-modal>
</template>

<script lang="ts" setup>
import { GET__cover_id__download__$coverId } from "ducksmanager/types/routes";
import { storeToRefs } from "pinia";
import { issueDetails } from "~/stores/issueDetails";

const { rejectAllIssueSuggestions, acceptIssueSuggestion } = issueDetails();
const { hasPendingIssueSuggestions } = storeToRefs(issueDetails());

const selectedExistingCoverIssuecode = ref(null as string | null);

const issueSuggestionsWithUrls = computed(() =>
  issueDetails()
    .issueSuggestions.filter(({ coverId }) => coverId)
    .map((issueSuggestion) => ({
      ...issueSuggestion,
      url:
        import.meta.env.VITE_DM_API_URL +
        GET__cover_id__download__$coverId.url.replace(
          ":coverId",
          String(issueSuggestion.coverId)
        ),
    }))
);
const images = computed(() =>
  issueSuggestionsWithUrls.value.map(
    ({ url, publicationcode, issuenumber }) => ({
      text: `${publicationcode} ${issuenumber}`,
      url,
    })
  )
);

const coverUrlToIssuecode = (url: string): string =>
  issueSuggestionsWithUrls.value.find(
    ({ url: issueSuggestionUrl }) => issueSuggestionUrl === url
  )?.issuecode || "";

const getPublicationcodeFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[0];
const getIssuenumberFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[1];
</script>
