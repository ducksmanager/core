<template>
  <div id="camera-preview" ref="cameraPreview"></div>
  <div ref="overlay" class="overlay">
    <ion-button ref="takePhotoButton" size="large" @click="takePhoto().then(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="apertureOutline" :md="apertureSharp" />
    </ion-button>
    <ion-button size="large" color="danger" @click="CameraPreview.stop().finally(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="closeOutline" :md="closeSharp" />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';
import { useElementSize } from '@vueuse/core';

import { apertureOutline, apertureSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';
import { onIonViewWillLeave } from '@ionic/vue';

const overlay = useTemplateRef<HTMLElement>('overlay');
const { height: overlayHeight } = useElementSize(overlay);

const cameraPreview = useTemplateRef<HTMLDivElement>('cameraPreview');

const { coverId: coverIdEvents } = inject(dmSocketInjectionKey)!;
const { takePhoto } = useCoverSearch(useRouter(), coverIdEvents);
const { isCameraPreviewShown } = storeToRefs(app());

onIonViewWillLeave(() => {
  isCameraPreviewShown.value = false;
});

watch(overlayHeight, async (overlayHeight) => {
  if (overlayHeight) {
    const boundingClientRect = Object.entries(cameraPreview.value!.getBoundingClientRect().toJSON()).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: parseInt(((value as number) - (key === 'height' ? overlayHeight : 0)).toFixed()),
      }),
      {},
    ) as DOMRect;
    if (boundingClientRect.height) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        parent: 'camera-preview',
        disableAudio: true,
        position: 'rear',
        ...boundingClientRect,
      };
      await CameraPreview.start(cameraPreviewOptions);
    }
  }
});
</script>

<style scoped>
#camera-preview,
.overlay {
  position: absolute;
  display: flex;
  justify-content: center;
  left: 0;
  bottom: 0;
  z-index: 10000;
  width: 100%;
}

#camera-preview {
  display: flex;
  height: 100%;

  video {
    width: 100%;
    height: 100%;
  }
}
</style>