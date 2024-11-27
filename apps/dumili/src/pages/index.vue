<template>
  <b-container class="h-100">
    <h4 class="sticky-top bg-light rounded-bottom text-black">
      {{ $t("Indexations en cours") }}
    </h4>
    <template v-if="currentIndexations">
      <b-row align-h="center">
        <b-col
          v-for="{ id, pages } of currentIndexations"
          :key="id"
          cols="12"
          class="d-flex p-5"
          md="4"
        >
          <router-link
            :to="`/indexation/${id}`"
            class="d-flex flex-grow-1 flex-column justify-content-center align-items-center"
          >
            <b-img
              :blank-color="pages[0]?.url ? undefined : 'lightgrey'"
              :src="pages[0]?.url || undefined"
              fluid
            />
            {{ $t("Numéro inconnu") }}
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
      :no-footer="stepNumber === 1"
      @ok.prevent="$refs.form!.$el.reportValidity() && (stepNumber = 1)"
    >
      <b-form
        v-if="stepNumber === 0"
        ref="form"
        @submit.prevent.stop="stepNumber = 1"
      >
        {{
          $t(
            "Combien de pages le magazine contient-il ? (y compris les pages que vous ne souhaitez pas indexer)",
          )
        }}
        <b-form-input v-model="totalPages" type="number" />
      </b-form>
      <div v-else>
        <b-alert variant="info" model-value :dismissible="false" class="mt-3"
          ><i18n-t
            keypath="Si vous possédez les pages du magazine avec le format PDF, assurez-vous que celui-ci ait une taille de fichier de 10 MB au maximum. Si ce n'est pas le cas, vous pouvez utiliser un outil tel que {link} pour compresser votre fichier de telle sorte qu'il fasse moins de 10 MB."
          >
            <template #link
              ><a
                href="https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-10mb"
                >11zon.com</a
              ></template
            >
          </i18n-t></b-alert
        >
        <upload-widget
          v-if="showUploadWidget && cloudinaryFolderName"
          parent-selector="#new-indexation-modal .modal-body"
          :folder-name="cloudinaryFolderName"
          @done="onUploadDone"
          @abort="showUploadWidget = !showUploadWidget"
        /></div></b-modal
  ></b-container>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { IndexationWithFirstPage } from "~dumili-services/indexation/types";
const router = useRouter();
const {
  indexations: { services: indexationsServices },
} = inject(dumiliSocketInjectionKey)!;

const form = ref<HTMLFormElement | null>(null);
const currentIndexations = ref<IndexationWithFirstPage[] | null>(null);
const modal = ref(false);
const totalPages = ref(16);
const cloudinaryFolderName = ref<string | null>(null);
const stepNumber = ref<0 | 1>(0);
const showUploadWidget = ref(false);

watch(stepNumber, (newStepNumber) => {
  if (newStepNumber > 0) {
    showUploadWidget.value = true;
    cloudinaryFolderName.value = new Date()
      .toISOString()
      .replace(/[-:.Z]/g, "");
  }
});

const onUploadDone = async () => {
  router.push(`/indexation/${cloudinaryFolderName.value}`);
};

(async () => {
  const { error, indexations } = await indexationsServices.getIndexations();
  if (error) {
    console.error(error);
  } else {
    currentIndexations.value = indexations;
  }
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