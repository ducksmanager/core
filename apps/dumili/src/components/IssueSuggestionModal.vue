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
import { getIndexationSocket } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { issueSuggestion } from "~prisma/client_dumili";
import { composables as dmComposables } from "~web";

const { coverIdServices } = dmComposables.useDmSocket;

const { acceptSuggestion, rejectAllSuggestions } = suggestions();
const { hasPendingIssueSuggestions, indexation } = storeToRefs(suggestions());

const indexationSocket = computed(() =>
  getIndexationSocket(indexation.value!.id)
);

const issueSuggestions = ref<
  (issueSuggestion & { url: string; coverId: number })[]
>([]);

const selectedExistingCoverIssuecode = ref<string | null>(null);

const validIssueSuggestions = computed(() =>
  issueSuggestions.value.filter(({ coverId }) => coverId)
);

watch(
  () => validIssueSuggestions.value,
  async (newValue) => {
    if (newValue.length) {
      issueSuggestions.value = (
        await Promise.all(
          newValue.map((issueSuggestion) =>
            coverIdServices.downloadCover(issueSuggestion.coverId)
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
  issueSuggestions.value.map(({ url, issuecode }) => ({
    text: issuecode,
    url,
  }))
);

const coverUrlToIssuecode = (url: string): string =>
  issueSuggestions.value.find(
    ({ url: issueSuggestionUrl }) => issueSuggestionUrl === url
  )?.issuecode || "";

const getPublicationcodeFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[0];
const getIssuenumberFromIssuecode = (issuecode: string) =>
  issuecode.split(" ")[1];

const acceptIssueSuggestion = async (issuecode: string) => {
  await indexationSocket.value.createIssueSuggestion(
    {
      source: "ai",
      indexationId: indexation.value!.id,
      issuecode,
    },
    true
  );
  selectedExistingCoverIssuecode.value = null;
};

const rejectAllIssueSuggestions = () => {
  for (const issueSuggestion of issueSuggestions.value) {
    issueSuggestion.seen = true;
  }
};
</script>
