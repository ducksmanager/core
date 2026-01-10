<template>
  <div id="camera-preview" ref="cameraPreview"></div>
  <ion-row id="overlay" ref="overlay" :class="{ portrait: isPortrait, landscape: !isPortrait }">
    <ion-button ref="takePhotoButton" size="large" @click="takePhoto()">
      <ion-icon :ios="apertureOutline" :md="apertureSharp" />
    </ion-button>
    <ion-button size="large" color="danger" @click="CameraPreview.stop().finally(() => (isCameraPreviewShown = false))">
      <ion-icon :ios="closeOutline" :md="closeSharp" />
    </ion-button>
    <div
      id="ratio-buttons"
      style="display: flex; position: absolute; bottom: 0; right: 0"
      class="ion-align-items-center"
    >
      <ion-button color="light" fill="clear" @click="currentRatioIndex = 1 - currentRatioIndex"
        ><ion-icon
          v-for="(ratio, index) in RATIOS"
          :key="ratio.name"
          :icon="ratio.icon"
          :class="{ selected: currentRatioIndex === index }"
        ></ion-icon
      ></ion-button>
    </div>
  </ion-row>
</template>

<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';
import { useElementSize } from '@vueuse/core';

import {
  apertureOutline,
  apertureSharp,
  closeOutline,
  closeSharp,
  tabletLandscapeOutline,
  tabletPortraitOutline,
} from 'ionicons/icons';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';
import { IonRow, onIonViewWillLeave } from '@ionic/vue';

type BoundingClientRect = { x: number; y: number; width: number; height: number };

const RATIOS = [
  {
    name: 'A4',
    ratio: 297 / 210,
    icon: tabletPortraitOutline,
  },
  {
    name: 'REVERSED_A4',
    ratio: 210 / 297,

    icon: tabletLandscapeOutline,
  },
] as const;

const currentRatioIndex = ref(0);

const overlay = useTemplateRef<InstanceType<typeof IonRow>>('overlay');
const { height: overlayHeight } = useElementSize(() => overlay.value);
const boundingClientRect = ref<BoundingClientRect>();

const { width, height } = useWindowSize();
const isPortrait = computed(() => width.value < height.value);
watch(isPortrait, () => {
  currentRatioIndex.value = isPortrait.value ? 0 : 1;
});

const cameraPreview = useTemplateRef<HTMLDivElement>('cameraPreview');

const { coverId: coverIdEvents, storySearch: storySearchEvents } = inject(dmSocketInjectionKey)!;
const { takePhoto } = useCoverSearch(useRouter(), coverIdEvents, storySearchEvents);
const { isCameraPreviewShown } = storeToRefs(app());

onIonViewWillLeave(() => {
  isCameraPreviewShown.value = false;
});

watch(isCameraPreviewShown, () => {
  if (!isCameraPreviewShown.value) {
    CameraPreview.stop();
  }
});

watch([overlayHeight, currentRatioIndex], async () => {
  if (overlayHeight.value) {
    const rect = cameraPreview.value!.getBoundingClientRect();
    boundingClientRect.value = Object.entries(rect.toJSON()).reduce((acc, [key, value]) => {
      acc[key as keyof BoundingClientRect] = parseInt((value as number).toFixed());
      return acc;
    }, {} as BoundingClientRect);
    const currentRatio = RATIOS[currentRatioIndex.value];
    if (isPortrait.value) {
      const heightAccordingToRatio = currentRatio.ratio * boundingClientRect.value.width;
      boundingClientRect.value.x = 0;
      boundingClientRect.value.y = 25 + Math.round((boundingClientRect.value.height - heightAccordingToRatio) / 2);
      boundingClientRect.value.height = heightAccordingToRatio;
    } else {
      const widthAccordingToRatio = boundingClientRect.value.height / currentRatio.ratio;
      boundingClientRect.value.x = (boundingClientRect.value.width - widthAccordingToRatio) / 2;
      boundingClientRect.value.y = 25;
      boundingClientRect.value.width = widthAccordingToRatio;
    }

    if (boundingClientRect.value?.height) {
      boundingClientRect.value.x = Math.round(boundingClientRect.value.x);
      boundingClientRect.value.y = Math.round(boundingClientRect.value.y);

      boundingClientRect.value.width = Math.round(boundingClientRect.value.width);
      boundingClientRect.value.height = Math.round(boundingClientRect.value.height);

      const cameraPreviewOptions: CameraPreviewOptions = {
        parent: 'camera-preview',
        disableAudio: true,
        position: 'rear',
        ...boundingClientRect.value,
      } as const;
      if ((await CameraPreview.isCameraStarted()).value) {
        await CameraPreview.stop();
      }
      await CameraPreview.start(cameraPreviewOptions);
    }
  }
});
</script>

<style scoped>
#camera-preview,
#overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  width: 100%;
  height: 100%;
}

#camera-preview {
  display: flex;
  &.portrait {
    height: calc(100vh - 4rem);
  }
  &.landscape {
    width: calc(100vw - 4rem);
  }

  video {
    width: 100%;
    height: 100%;
  }
}
#overlay {
  position: absolute;
  &.portrait {
    bottom: 1rem;
    height: 4rem;
  }
  &.landscape {
    right: 1rem;
    width: 4rem;
  }
}
ion-button {
  &::part(native) {
    font-size: 2rem;
  }
}

#ratio-buttons {
  ion-button {
    min-height: initial;
    &::part(native) {
      height: inherit;
    }

    ion-icon.selected {
      --ionicon-stroke-width: 48px;
    }
  }
}

.button-large {
  --min-height: initial;
}
</style>
