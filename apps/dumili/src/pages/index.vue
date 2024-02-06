<template>
  <h4 class="sticky-top">Indexations en cours</h4>
  <template v-if="currentIndexations">
    <b-row align-h="center">
      <b-col
        v-for="indexation of currentIndexations"
        :key="indexation.indexation"
        class="col"
        cols="12"
        md="4"
      >
        <router-link
          :to="`/indexation/${indexation.indexation}`"
          class="d-flex flex-column align-items-center"
        >
          <b-img :src="indexation.url" fluid thumbnail />
          Numéro inconnu
        </router-link>
      </b-col>
    </b-row>
    <h4 v-if="!currentIndexations.length" fluid>
      Aucune indexation en cours
    </h4></template
  >
  <template v-else>Loading...</template>

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
    @cancel="uploadType = 'some'"
  >
    De quelles pages du numéro que vous souhaitez indexer possédez vous des
    scans ?
  </b-modal>
  <upload-widget
    v-if="showUploadWidget && cloudinaryFolderName"
    :folder-name="cloudinaryFolderName"
    @done="router.push(`/indexation/${cloudinaryFolderName}`)"
    @abort="showUploadWidget = !showUploadWidget"
  />
</template>

<script setup lang="ts">
import { cloudinaryIndexationsServices } from "~/composables/useDumiliSocket";

const router = useRouter();

const currentIndexations = ref(
  null as { url: string; indexation: string }[] | null
);
const modal = ref(false);
const cloudinaryFolderName = ref<string | null>(null);
const stepNumber = ref(0);
const uploadType = ref<"all" | "some" | null>(null);
const showUploadWidget = ref(false);

watch(
  () => uploadType.value,
  (newUploadType) => {
    if (newUploadType !== null) {
      stepNumber.value = 1;
      showUploadWidget.value = true;
      cloudinaryFolderName.value = new Date()
        .toISOString()
        .replace(/[-:.Z]/g, "");
    }
  }
);

(async () => {
  const { error, resources } =
    await cloudinaryIndexationsServices.getResources();
  if (error) {
    console.error(error);
  } else {
    currentIndexations.value = resources.map(({ url, context }) => ({
      url,
      indexation: context.custom.indexation,
    }));
  }
})();
</script>
