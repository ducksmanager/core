<template>
  <b-container class="h-100">
    <h4 class="sticky-top bg-light rounded-bottom text-black">
      {{ $t("Indexations en cours") }}
    </h4>
    <template v-if="currentIndexations">
      <b-row align-h="center">
        <b-col
          v-for="{ id, acceptedIssueSuggestion, pages } of currentIndexations"
          :key="id"
          cols="12"
          class="d-flex p-5"
          md="3"
        >
          <router-link
            :to="`/indexation/${id}`"
            class="d-flex position-relative flex-grow-1 flex-column justify-content-center align-items-center bg-light p-5"
          >
            <b-button
              class="position-absolute top-0 end-0 text-danger bg-light p-0 border-0"
              @click.stop.prevent="deleteIndexation(id)"
            >
              <i-bi-x
                v-b-tooltip="{ title: $t('Supprimer') }"
                class="display-6"
            /></b-button>
            <b-img
              :blank-color="pages[0]?.image?.url ? undefined : 'lightgrey'"
              :src="pages[0]?.image?.url || undefined"
              fluid
            />
            <div class="position-absolute bottom-0 pb-3">
              <Issue v-bind="acceptedIssueSuggestion" />
            </div>
          </router-link>
        </b-col>
      </b-row>
      <h4 v-if="!currentIndexations.length" fluid>
        {{ $t("Aucune indexation en cours") }}
      </h4></template
    >
    <template v-else>{{ $t("Chargement...") }}</template></b-container
  >
  <b-container fluid class="position-absolute bottom-0 start-0">
    <div>
      <b-button @click="modal = !modal">{{
        $t("Nouvelle indexation")
      }}</b-button>
    </div>
    <b-modal
      id="new-indexation-modal"
      v-model="modal"
      :title="$t('Nouvelle indexation')"
      :cancel-title="$t('Annuler')"
      align="center"
      centered
      @ok.prevent="$refs.form!.$el.reportValidity() && (createIndexation())"
    >
      <b-form ref="form" @submit.prevent.stop="createIndexation">
        {{
          $t(
            "Combien de pages le magazine contient-il ? (y compris les pages que vous ne souhaitez pas indexer)",
          )
        }}
        <b-form-input
          v-model="totalPages"
          type="number"
          min="4"
          max="996" /></b-form></b-modal
  ></b-container>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const router = useRouter();
const {
  indexations: { services: indexationsServices },
  getIndexationSocketFromId,
} = inject(dumiliSocketInjectionKey)!;

const { fetchPublicationNames } = coa();

const form = ref<HTMLFormElement | null>(null);
const currentIndexations =
  ref<ReturnType<typeof indexationsServices.getIndexations>>();
const modal = ref(false);
const totalPages = ref(16);

const createIndexation = async () => {
  const cloudinaryFolderName = new Date().toISOString().replace(/[-:.Z]/g, "");

  await indexationsServices.create(cloudinaryFolderName, totalPages.value);
  router.push(`/indexation/${cloudinaryFolderName}`);
};

const deleteIndexation = async (id: string) => {
  const indexationSocket = getIndexationSocketFromId(id);

  await indexationSocket.services.deleteIndexation();
  window.location.reload();
};

watch(currentIndexations, (indexations) => {
  fetchPublicationNames(
    indexations!
      .map(
        ({ acceptedIssueSuggestion }) =>
          acceptedIssueSuggestion?.publicationcode,
      )
      .filter(Boolean) as string[],
  );
});

(async () => {
  currentIndexations.value = await indexationsServices.getIndexations();
})();
</script>

<style lang="scss">
.modal {
  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 800px;
    }
  }
}
</style>