<template>
  <template v-if="hasPendingIssueSuggestions">
    <b-modal
      :model-value="hasPendingIssueSuggestions"
      title="Dumili a de nouvelles suggestions !"
      align="center"
      centered
      :ok-disabled="!selectedExistingCoverIssuecode"
      cancel-title="Annuler"
      @ok.prevent="acceptIssueSuggestion(selectedExistingCoverIssuecode!)"
      @cancel.prevent="rejectAllIssueSuggestions"
    >
      <div class="m-3">
        {{
          $t(
            "Dumili a trouvé des couvertures existantes ressemblant à la vôtre. Sélectionnez la couverture qui ressemble le plus à la vôtre.",
          )
        }}<br />{{ $t('Si aucune ne ressemble,cliquez sur "Annuler".') }}
      </div>
      <Gallery
        :pages="
          images.map(({ url, id }) => ({ image: { url }, id, pageNumber: 0 }))
        "
        selectable
      ></Gallery> </b-modal
  ></template>
</template>

<script lang="ts" setup>
import { injectLocal } from "@vueuse/core";

import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import type { issueSuggestion } from "~prisma/client_dumili";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { t: $t } = useI18n();
const {
  coverId: { events: coverIdEvents },
} = inject(dmSocketInjectionKey)!;
const { indexationSocket } = injectLocal(dumiliSocketInjectionKey)!;

const { hasPendingIssueSuggestions } = storeToRefs(suggestions());
const { createIssueSuggestion } = suggestions();

const { issuecodeDetails } = storeToRefs(coa());

const issueSuggestions = ref<
  (issueSuggestion & { url: string; coverId: number })[]
>([]);

const selectedExistingCoverIssuecode = ref<string>();

const validIssueSuggestions = computed(() =>
  issueSuggestions.value.filter(({ coverId }) => coverId),
);

watch(
  validIssueSuggestions,
  async (newValue) => {
    if (newValue.length) {
      issueSuggestions.value = (
        await Promise.all(
          newValue.map((issueSuggestion) =>
            coverIdEvents.getCoverUrl(issueSuggestion.coverId),
          ),
        )
      ).map((url, i) => ({
        ...newValue[i],
        url,
      }));
    }
  },
  { immediate: true },
);

const images = computed(() =>
  issueSuggestions.value.map(({ url, id, publicationcode, issuenumber }) => ({
    id,
    text: `${publicationcode} ${issuenumber}` || $t("Titre inconnu"),
    url,
  })),
);

const acceptIssueSuggestion = async (issuecode: string) => {
  const { publicationcode, issuenumber } = issuecodeDetails.value[issuecode];
  const { suggestionId } = await createIssueSuggestion({
    publicationcode,
    issuenumber,
    ai: true,
  });
  await indexationSocket.value!.events.acceptIssueSuggestion(suggestionId);
  selectedExistingCoverIssuecode.value = undefined;
};

const rejectAllIssueSuggestions = () => {
  // for (const issueSuggestion of issueSuggestions.value) {
  //   issueSuggestion.seen = true;
  // }
};
</script>
