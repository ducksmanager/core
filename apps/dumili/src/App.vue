<template>
  <b-container class="position-fixed start-0 bottom-0 mw-100" style=""
    ><b-tabs align="center" v-model:modelValue="activeTab"
      ><b-tab title="Gallery" /><b-tab title="Text editor" /><b-tab
        title="Book" /></b-tabs
  ></b-container>
  <b-container fluid>
    <template v-if="activeTab === 0">
      <h2>DuMILi</h2>
      <h3>DucksManager Inducks Little helper</h3>
      <upload-widget
        v-if="showUploadWidget"
        @done="getPageImages()"
        @abort="showUploadWidget = !showUploadWidget"
      />
      <b-button
        v-show="!showUploadWidget"
        @click="showUploadWidget = !showUploadWidget"
      >
        Upload files
      </b-button>

      <b-row align-h="center">
        <b-col
          class="col"
          v-for="image of images"
          :key="image.toURL()"
          cols="12"
          md="4"
        >
          <b-img :src="image.toURL()" thumbnail fluid />
        </b-col>
      </b-row>
    </template>
    <template v-if="activeTab === 1">
      <textarea></textarea>
    </template>
  </b-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CloudinaryImage } from "@cloudinary/url-gen/assets/CloudinaryImage";

const cloudName = "dl7hskxab";
const showUploadWidget = ref(false);

const activeTab = ref(0);

const images = ref([
  new CloudinaryImage("logo", { cloudName }, { analytics: false }),
  new CloudinaryImage("dumili/btn-agenda", { cloudName }, { analytics: false }),
] as CloudinaryImage[]);

const getPageImages = () => {
  showUploadWidget.value = !showUploadWidget.value;
};
</script>

<style lang="scss">
.col {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
