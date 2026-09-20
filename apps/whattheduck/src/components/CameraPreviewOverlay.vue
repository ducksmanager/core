<template>
  <div id="camera-preview-container" :class="{ portrait: isPortrait, landscape: !isPortrait }">
    <div id="camera-bg-overlays" aria-hidden="true">
      <div v-if="!boundingClientRect" class="camera-bg-overlay camera-bg-full" />
      <template v-else>
        <div class="camera-bg-overlay camera-bg-top" :style="{ height: `${boundingClientRect.y}px` }" />
        <div
          class="camera-bg-overlay camera-bg-bottom"
          :style="{ top: `${boundingClientRect.y + boundingClientRect.height}px` }"
        />
        <div
          class="camera-bg-overlay camera-bg-left"
          :style="{
            top: `${boundingClientRect.y}px`,
            width: `${boundingClientRect.x}px`,
            height: `${boundingClientRect.height}px`,
          }"
        />
        <div
          class="camera-bg-overlay camera-bg-right"
          :style="{
            top: `${boundingClientRect.y}px`,
            left: `${boundingClientRect.x + boundingClientRect.width}px`,
            height: `${boundingClientRect.height}px`,
          }"
        />
      </template>
    </div>
    <div id="camera-preview" ref="cameraPreview"></div>
    <div
      v-if="detectionBox && previewRect"
      id="detection-layer"
      aria-hidden="true"
      :style="{
        left: `${previewRect.x}px`,
        top: `${previewRect.y}px`,
        width: `${previewRect.width}px`,
        height: `${previewRect.height}px`,
      }"
    >
      <div
        id="detection-box"
        :style="{
          left: `${detectionBox.x - previewRect.x}px`,
          top: `${detectionBox.y - previewRect.y}px`,
          width: `${detectionBox.width}px`,
          height: `${detectionBox.height}px`,
        }"
      />
    </div>
    <ion-row id="overlay" ref="overlay" :class="{ portrait: isPortrait, landscape: !isPortrait }">
      <div id="overlay-status">
        <ion-button
          v-if="!isLiveCoverSearchEnabled || phase === 'exhausted'"
          ref="takePhotoButton"
          size="large"
          :disabled="isSearching"
          @click="takePhoto()"
        >
          <ion-icon :ios="apertureOutline" :md="apertureSharp" />
        </ion-button>
        <template v-else-if="['scanning', 'confirming'].includes(phase)">
          <ion-spinner name="dots" />
          <span class="status-label"
            ><template v-if="phase === 'scanning'">{{ $t('Recherche de la couverture...') }}</template
            ><template v-else-if="phase === 'confirming'">{{ $t('Confirmation de la couverture...') }}</template></span
          >
        </template>
      </div>
      <ion-button id="close-button" color="danger" :disabled="isSearching" @click="closeCamera">
        <ion-icon :ios="closeOutline" :md="closeSharp" />
      </ion-button>
      <div id="ratio-buttons" class="ion-align-items-center">
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
    <CoverSuggestionCard
      v-if="phase === 'matched' && suggestion"
      :cover="suggestion"
      @confirm="confirmSuggestion"
      @dismiss="dismiss"
    />
  </div>
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
import { CameraPreview, CameraPreviewOptions } from '@capgo/camera-preview';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import useCoverSearch from '~/composables/useCoverSearch';
import useLiveCoverSearch from '~/composables/useLiveCoverSearch';
import { mapFrameRectToPreview } from '~/composables/useDetectionBox';
import { app } from '~/stores/app';
import { IonRow, onIonViewWillLeave } from '@ionic/vue';

type BoundingClientRect = { x: number; y: number; width: number; height: number };

/** 'contain' is the plugin's own default: the stream is fitted into the view and letterboxed. */
const ASPECT_MODE = 'contain' as const;

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

const { coverId: coverIdEvents } = inject(dmSocketInjectionKey)!;
const router = useRouter();
const { takePhoto, isSearching, searchOneFrame } = useCoverSearch(router, coverIdEvents);
const { phase, suggestion, suggestionFrameSize, covers, start, stop, dismiss } = useLiveCoverSearch(searchOneFrame);

// Pastec reports where in the uploaded frame the cover was found; place that on the live preview.
/**
 * The geometry CameraPreview.start() reports back, which is where the preview actually ended up —
 * the plugin clamps and letterboxes the rect we ask for, so the requested one cannot place the box.
 */
const previewRect = ref<BoundingClientRect>();

const detectionBox = computed(() =>
  suggestion.value?.boundingRect && suggestionFrameSize.value && previewRect.value
    ? mapFrameRectToPreview(suggestion.value.boundingRect, suggestionFrameSize.value, previewRect.value, ASPECT_MODE)
    : undefined,
);
const { isCameraPreviewShown, isLiveCoverSearchEnabled } = storeToRefs(app());

const confirmSuggestion = async () => {
  stop();
  const searchResults = JSON.stringify(covers.value);
  if (Capacitor.isNativePlatform()) {
    await CameraPreview.stop().catch(() => {});
  }
  isCameraPreviewShown.value = false;
  await router.push({ path: '/cover-search-results', query: { searchResults, origin: 'takePhoto' } });
};

const closeCamera = () => {
  stop();
  CameraPreview.stop().finally(() => {
    isCameraPreviewShown.value = false;
  });
};

onIonViewWillLeave(() => {
  stop();
  isCameraPreviewShown.value = false;
});

watch(isCameraPreviewShown, () => {
  if (!isCameraPreviewShown.value) {
    stop();
    CameraPreview.stop();
  }
});

// Scanning must not survive the app going to the background.
const pauseListener = App.addListener('pause', stop);
onUnmounted(() => {
  stop();
  pauseListener.then((listener) => listener.remove());
});

watch([overlayHeight, currentRatioIndex], async () => {
  if (overlayHeight.value && cameraPreview.value) {
    await nextTick();
    const rect = cameraPreview.value.getBoundingClientRect();
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
        force: true,
        toBack: true,
        // Pinned rather than left to the plugin default, since the detection box maths depends on it.
        aspectMode: ASPECT_MODE,
        ...boundingClientRect.value,
      } as const;
      try {
        // The preview is restarted on every resize/rotation, so the loop is rebound to the new session.
        stop();
        previewRect.value = await CameraPreview.start(cameraPreviewOptions);
        if (isLiveCoverSearchEnabled.value) {
          start();
        }
      } catch (err) {
        previewRect.value = undefined;
        console.error('CameraPreview.start failed:', err);
      }
    }
  }
});
</script>

<style scoped>
#camera-preview-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: transparent;
}
#camera-preview-container.portrait #camera-preview {
  flex: 1;
  min-height: 0;
}
#camera-preview-container.landscape #camera-preview {
  flex: 1;
  min-width: 0;
}
#camera-bg-overlays {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.camera-bg-overlay {
  position: absolute;
  background: var(--dm-background-color);
}

.camera-bg-full {
  inset: 0;
}

.camera-bg-top {
  top: 0;
  left: 0;
  right: 0;
}

.camera-bg-bottom {
  left: 0;
  right: 0;
  bottom: 0;
}

.camera-bg-left {
  left: 0;
}

.camera-bg-right {
  right: 0;
}

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
  background: transparent !important;
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
  background: var(--dm-background-color);
  /* Three slots so the close button can never land on top of the ratio buttons. */
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.5rem;
  &.portrait {
    bottom: 1rem;
    height: 4rem;
  }
  &.landscape {
    right: 1rem;
    width: 4rem;
    flex-direction: column;
    padding: 0.5rem 0;
  }
}

#overlay-status {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;

  .status-label {
    overflow: hidden;
    font-size: 0.9rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    opacity: 0.8;
  }
}

#overlay-status ion-button,
#close-button {
  flex: none;
  &::part(native) {
    font-size: 1.6rem;
  }
}

#ratio-buttons {
  display: flex;
  flex: none;

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

#detection-layer {
  position: fixed;
  z-index: 10000;
  overflow: hidden;
  pointer-events: none;
}

#detection-box {
  position: absolute;
  border: 3px solid var(--ion-color-success, #2dd36f);
  border-radius: 6px;
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 25%);
  animation: detection-box-in 200ms ease-out;
}

@keyframes detection-box-in {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

#scanning-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
