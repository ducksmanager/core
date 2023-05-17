<template>
  <ion-page
    ><div id="cameraPreview"></div>
    <div class="overlay">
      <ion-button @click="takePhoto"> <ion-icon :ios="apertureOutline" :md="apertureSharp"></ion-icon></ion-button>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonIcon, IonButton } from '@ionic/vue';
import { call } from '~/axios-helper';
import { onMounted } from 'vue';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';

import { apertureOutline, apertureSharp } from 'ionicons/icons';
import axios from 'axios';
import { POST__collection__issues__multiple, PUT__cover_id__search } from 'ducksmanager/types/routes';
function dataURIToBlob(dataURI: string) {
  const byteString = atob(dataURI);
  const mimeString = 'image/jpeg';

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return new Blob([ia], { type: mimeString });
}
onMounted(async () => {
  const cameraPreviewOptions: CameraPreviewOptions = {
    parent: 'cameraPreview'!,
    position: 'rear',
    height: 1920,
    width: 1080,
  };
  CameraPreview.start(cameraPreviewOptions);
});

const takePhoto = async () => {
  const { value: base64 } = await CameraPreview.capture({
    quality: 80,
  });
  const searchResults = await call(axios, new PUT__cover_id__search({ reqBody: { base64 } }));
  console.log(searchResults.data);
};
</script>
<style lang="scss" scoped>
#cameraPreview {
  height: 100%;
  display: flex;
  justify-content: center;
  border: 1px solid brown;
}
.overlay {
  position: absolute;
  display: flex;
  align-items: end;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
