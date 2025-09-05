<template>
  <div :id="cameraPreviewElementId"></div>
  <div ref="overlay" class="overlay">
    <ion-button ref="takePhotoButton" size="large" @click="takePhoto().then(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="apertureOutline" :md="apertureSharp" />
    </ion-button>
    <ion-button size="large" color="danger" @click="isCameraPreviewShown = false">
      <ion-icon :ios="closeOutline" :md="closeSharp" />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { apertureOutline, apertureSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';
import { onIonViewWillLeave } from '@ionic/vue';

const cameraPreviewElementId = 'camera-preview';

const { coverId: coverIdEvents } = inject(dmSocketInjectionKey)!;
const { takePhoto } = useCoverSearch(useRouter(), coverIdEvents);
const { isCameraPreviewShown } = storeToRefs(app());

const overlay = ref<HTMLElement>();
const takePhotoButton = ref<{ $el: HTMLElement }>();

watch(isCameraPreviewShown, async () => {
  if (isCameraPreviewShown.value) {
    let loopIteration = 0;
    const interval = setInterval(() => {
      const boundingClientRect = Object.entries(overlay.value!.getBoundingClientRect().toJSON()).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: parseInt(
            ((value as number) - (key === 'height' ? takePhotoButton.value!.$el.clientHeight : 0)).toFixed(),
          ),
        }),
        {},
      ) as DOMRect;

      if (boundingClientRect.height) {
        clearInterval(interval);
        const cameraPreviewOptions: CameraPreviewOptions = {
          parent: cameraPreviewElementId,
          disableAudio: true,
          position: 'rear',
          ...boundingClientRect,
        };
        CameraPreview.start(cameraPreviewOptions);
      } else if (loopIteration > 10) {
        console.error('Could not get overlayElement height');
        clearInterval(interval);
      }
      loopIteration++;
    }, 50);
  } else {
    CameraPreview.stop();
  }
});

onIonViewWillLeave(() => {
  isCameraPreviewShown.value = false;
});
</script>

<style scoped>
#camera-preview,
.overlay {
  position: absolute;
  display: flex;
  justify-content: center;
  left: 0;
  top: 0;
  z-index: 10000;
  width: 100%;
}

#camera-preview {
  display: flex;

  video {
    width: 100%;
    height: 100%;
  }
}
</style>