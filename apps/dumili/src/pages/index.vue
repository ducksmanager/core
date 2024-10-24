<template>
  <b-container>
    <h4 class="sticky-top">Indexations en cours</h4>
    <template v-if="currentIndexations">
      <b-row align-h="center">
        <b-col
          v-for="{ id, pages } of currentIndexations"
          :key="id"
          class="col"
          cols="12"
          md="4"
        >
          <router-link
            :to="`/indexation/${id}`"
            class="d-flex flex-column align-items-center border"
          >
            <b-img :src="pages[0]?.url" fluid thumbnail />
            Numéro inconnu
          </router-link>
        </b-col>
      </b-row>
      <h4 v-if="!currentIndexations.length" fluid>
        Aucune indexation en cours
      </h4></template
    >
    <template v-else>Loading...</template></b-container
  >
  <b-container fluid class="position-absolute bottom-0 start-0">
    <div>
      <b-button @click="modal = !modal">Nouvelle indexation</b-button>
    </div>
    <b-modal
      v-if="stepNumber === 0"
      v-model="modal"
      title="Indexation"
      align="center"
      centered
      ok-title="Toutes les pages"
      cancel-title="Seulement certaines pages"
      @ok.prevent="uploadType = 'all'"
      @cancel.prevent="uploadType = 'some'"
    >
      De quelles pages du numéro que vous souhaitez indexer possédez vous des
      scans ?
      <b-alert variant="info" model-value :dismissible="false" class="mt-3"
        >Si vous posséedez les pages du magazine avec le format PDF,
        assurez-vous que celui-ci ait une taille de fichier de 10 MB au maximum.
        Si ce n'est pas le cas, vous pouvez utiliser un outil tel que
        <a href="https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-10mb"
          >11zon.com</a
        >
        pour compresser votre fichier de telle sorte qu'il fasse moins de 10
        MB.</b-alert
      >
    </b-modal>
    <upload-widget
      v-if="showUploadWidget && cloudinaryFolderName"
      :folder-name="cloudinaryFolderName"
      @done="onUploadDone"
      @abort="showUploadWidget = !showUploadWidget"
  /></b-container>
</template>

<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { IndexationWithFirstPage } from "~dumili-services/indexation/types";
const router = useRouter();
const {
  indexations: { services: indexationsServices },
} = inject(dumiliSocketInjectionKey)!;

const currentIndexations = ref<IndexationWithFirstPage[] | null>(null);
const modal = ref(false);
const cloudinaryFolderName = ref<string | null>(null);
const stepNumber = ref<0 | 1>(0);
const uploadType = ref<"all" | "some" | null>(null);
const showUploadWidget = ref(false);

watch(uploadType, (newUploadType) => {
  if (newUploadType !== null) {
    stepNumber.value = 1;
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
