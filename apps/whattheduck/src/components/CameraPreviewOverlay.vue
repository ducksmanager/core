<template>
  <div id="camera-preview" ref="cameraPreview"></div>
  <ion-row ref="overlay" class="overlay">
    <ion-button ref="takePhotoButton" size="large" @click="takePhoto().then(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="apertureOutline" :md="apertureSharp" />
    </ion-button>
    <ion-button size="large" color="danger" @click="CameraPreview.stop().finally(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="closeOutline" :md="closeSharp" />
    </ion-button>
    <!-- <div id="ratio-buttons" style="display: flex; position: absolute; top: 0; right: 0" class="ion-align-items-center">
      <ion-button
        v-for="ratio in RATIOS"
        :key="ratio.name"
        :style="{ width: '50px', height: `${50 * ratio.ratio}px`, borderWidth: '5px' }"
        class="ion-no-padding"
        fill="outline"
        color="light"
        @click="currentRatio = ratio"
      ></ion-button>
    </div> -->
  </ion-row>
</template>

<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';
import { useElementSize } from '@vueuse/core';

import { apertureOutline, apertureSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';
import { IonRow, onIonViewWillLeave } from '@ionic/vue';

// const RATIOS = [
//   {
//     name: 'A4',
//     ratio: 297 / 210,
//   },
//   {
//     name: 'REVERSED_A4',
//     ratio: 210 / 297,
//   },
// ] as const;

// const currentRatio = ref<(typeof RATIOS)[number]>(RATIOS[0]);

const overlay = useTemplateRef<InstanceType<typeof IonRow>>('overlay');
const { height: overlayHeight } = useElementSize(() => overlay.value);

const cameraPreview = useTemplateRef<HTMLDivElement>('cameraPreview');

const { coverId: coverIdEvents } = inject(dmSocketInjectionKey)!;
const { takePhoto } = useCoverSearch(useRouter(), coverIdEvents);
const { isCameraPreviewShown } = storeToRefs(app());

onIonViewWillLeave(() => {
  isCameraPreviewShown.value = false;
});

watch(overlayHeight, async () => {
  if (overlayHeight.value) {
    const boundingClientRect = Object.entries(cameraPreview.value!.getBoundingClientRect().toJSON()).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: parseInt(((value as number) - (key === 'height' ? overlayHeight.value : 0)).toFixed()),
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
  bottom: 1rem;
  z-index: 10000;
  width: 100%;
}
ion-button {
  &::part(native) {
    font-size: 2rem;
  }
}

.button-large {
  --min-height: initial;
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