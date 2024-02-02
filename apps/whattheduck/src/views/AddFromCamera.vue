<template>
  <ion-page>
    <div id="cameraPreview">
      <img v-if="isPlatform('desktop')" id="cover-mock" src="/covers/fr/mpp/fr_mpp_1415d_001.jpg" />
    </div>
    <div class="overlay">
      <ion-button @click="takePhoto">
        <ion-icon :ios="apertureOutline" :md="apertureSharp" />
      </ion-button>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { isPlatform } from '@ionic/vue';
import { apertureOutline, apertureSharp } from 'ionicons/icons';

const getDataURIFromImageElement = () => {
  const imageElement = document.getElementById('cover-mock') as HTMLImageElement;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set the canvas size to match the image
  canvas.width = imageElement!.width;
  canvas.height = imageElement!.height;

  // Draw the image on the canvas
  ctx!.drawImage(imageElement!, 0, 0);

  return canvas.toDataURL();
};

const dataURIToBlob = (dataURL: string) => {
  const byteString = atob(dataURL.split(',')[1]);

  const mimeType = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // Write the binary data to a typed array
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeType });
};

function base64ToBlob(base64String: string) {
  const dataUrlPrefixIndex = base64String.indexOf(',');
  if (dataUrlPrefixIndex === -1) {
    throw new Error('Invalid Base64 string: no data URL prefix found.');
  }
  const base64Data = base64String.substring(dataUrlPrefixIndex + 1);

  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: '' });
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
  let data = new FormData();
  //const blob = dataURIToBlob(getDataURIFromImageElement()); // Mocked for web
  const blob = base64ToBlob(base64);

  data.append('image', blob);
  const response = await fetch('http://localhost:5000/search_image', {
    method: 'post',
    body: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log(response.body);
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

img {
  position: absolute;
  width: 50%;
  height: 50%;
}
</style>
