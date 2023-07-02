<template>
  <b-container fluid>
    <h2>DuMILi</h2>
    <h3>DucksManager Inducks Little helper</h3>
    <template v-if="currentIndexations">
      <b-container v-for="indexation of currentIndexations">{{
        indexation
      }}</b-container>
      <h4 fluid v-if="!currentIndexations.length">
        Aucune indexation en cours
      </h4></template
    >
    <template v-else>Loading...</template>
    <div><b-button @click="modal = !modal">Indexer un numéro</b-button></div>
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
  /></b-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defaultApi } from "../util/api";
import { AxiosResponse } from "axios";

const router = useRouter();

const currentIndexations = ref(null as any[] | null);
const modal = ref(false);
const cloudinaryFolderName = ref(null as string | null);
const stepNumber = ref(0);
const uploadType = ref(null as "all" | "some" | null);
const showUploadWidget = ref(false as boolean);

defaultApi
  .get(`${import.meta.env.VITE_BACKEND_URL}/cloudinary/folder`)
  .then(
    (res: AxiosResponse<{ folders: (typeof currentIndexations)["value"] }>) => {
      currentIndexations.value = res.data.folders;
    }
  );

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
</script>
