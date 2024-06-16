<template>
  <ion-content v-if="!items" ref="content">
    {{ t('Chargement...') }}
  </ion-content>
  <ion-content v-else-if="!items.length" ref="content">
    {{ t('Votre collection est vide.') }}
  </ion-content>
  <ion-content
    v-else
    ref="content"
    class="no-padding"
    scroll-events
    @ion-scroll="onScroll"
    @ion-scroll-end="isScrolling = false"
  >
    <template v-if="$slots['row-label']">
      <Row
        v-for="{ key, item, isOwned, nextItemType } in filteredItems"
        :is-owned="isOwned"
        :next-item-type="nextItemType"
        @click="currentNavigationItem = key"
      >
        <template #fill-bar v-if="item">
          <slot name="fill-bar" :item="item" />
        </template>
        <template #prefix v-if="item">
          <slot name="row-prefix" :item="item" />
        </template>
        <template #label>
          <slot name="row-label" :item="item" />
        </template>
        <template #suffix>
          <slot name="row-suffix" :item="item" />
        </template> </Row
    ></template>
    <slot v-else name="default" />
    <EditIssuesButton @show-camera-preview="showCameraPreview = true" />

    <template v-if="showCameraPreview">
      <div :id="cameraPreviewElementId">
        <img v-if="isPlatform('desktop')" id="cover-mock" src="/covers/fr/mpp/fr_mpp_1415d_001.jpg" />
      </div>
      <div class="overlay">
        <ion-button @click="takePhoto().then(() => (showCameraPreview = false))" size="large">
          <ion-icon :ios="apertureOutline" :md="apertureSharp" />
        </ion-button>
        <ion-button size="large" color="danger" @click="showCameraPreview = false">
          <ion-icon :ios="closeOutline" :md="closeSharp" />
        </ion-button></div
    ></template>

    <div
      v-show="isScrolling"
      v-if="itemInCenterOfViewport"
      id="scroll-text"
      slot="fixed"
      :style="{ top: `${scrollPositionPct}%` }"
    >
      {{ getItemTextFn(itemInCenterOfViewport) }}
    </div></ion-content
  >
</template>

<script setup lang="ts" generic="Item extends Required<any>">
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';
import type { ScrollDetail } from '@ionic/vue';
import { IonContent, isPlatform } from '@ionic/vue';
import { apertureOutline, apertureSharp, closeOutline, closeSharp } from 'ionicons/icons';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';

defineSlots<{
  'default'(): any;
  'fill-bar'(props: { item: Item }): any;
  'row-prefix'(props: { item: Item }): any;
  'row-label'(props: { item: Item }): any;
  'row-suffix'(props: { item: Item }): any;
}>();

const props = defineProps<{
  items: { key: string; item: Item; isOwned?: boolean; nextItemType?: 'same' | 'owned' | undefined }[];
  getItemTextFn: (item: Item) => string;
  issueViewModes?: { label: string; icon: { ios: string; md: string } }[];
  filter?: { label: string; icon: { ios: string; md: string } }[];
}>();

const emit = defineEmits<{
  (e: 'items-filtered', items: string[]): void;
}>();

const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;

const cameraWidth = parseInt(String(window.screen.width * 0.5));
const cameraHeight = parseInt(String((cameraWidth * 30) / 21));
const cameraX = parseInt(String(cameraWidth / 2));
const cameraY = 150 + parseInt(String(cameraHeight / 2));

const showCameraPreview = ref(false);
const cameraPreviewElementId = 'cameraPreview';
const { takePhoto } = useCoverSearch(useRouter(), coverIdServices);

watch(showCameraPreview, () => {
  if (showCameraPreview.value) {
    const cameraPreviewOptions: CameraPreviewOptions = {
      parent: cameraPreviewElementId,
      position: 'rear',
      width: cameraWidth,
      height: cameraHeight,
      x: cameraX,
      y: cameraY,
    };
    CameraPreview.start(cameraPreviewOptions);
  } else {
    CameraPreview.stop();
  }
});

const content = ref<InstanceType<typeof IonContent> | null>(null);

const scrollPositionPct = ref<number>(0);
const isScrolling = ref(false);

const onScroll = (e: CustomEvent<ScrollDetail>) => {
  const scrollTop = e.detail.scrollTop;
  isScrolling.value = e.detail.isScrolling;
  const innerScrollElement = content.value!.$el.shadowRoot.querySelector('.inner-scroll');
  const scrollHeight = innerScrollElement.scrollHeight;
  const clientHeight = innerScrollElement.clientHeight;

  const middleOfViewport = scrollTop + clientHeight / 2;

  scrollPositionPct.value = (middleOfViewport / scrollHeight) * 100;
};

const { t } = useI18n();

const { currentNavigationItem, filterText } = storeToRefs(app());

const itemInCenterOfViewport = computed(() => {
  if (!props.items.length) {
    return undefined;
  }
  const itemIndex = Math.floor((scrollPositionPct.value * props.items.length) / 100);
  return props.items[itemIndex].item;
});

const filteredItems = computed(() =>
  props.items.filter(({ item }) => props.getItemTextFn(item).toLowerCase().includes(filterText.value.toLowerCase())),
);

watch(
  filteredItems,
  (items) => {
    emit(
      'items-filtered',
      items.map(({ key }) => key),
    );
  },
  { immediate: true },
);
</script>

<style scoped>
::v-deep(ion-content img) {
  margin-right: 1rem;
}
strong {
  font-size: 20px;
  line-height: 26px;
}

p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

a {
  text-decoration: none;
}

ion-searchbar {
  display: flex;
  align-items: center;
  padding: 0 !important;
  height: 25px !important;

  > div,
  > div > input {
    height: 100% !important;
  }

  .searchbar-input-container {
    display: flex;
    align-items: center;

    .searchbar-clear-button {
      left: 0;
      width: 24px;
    }

    .searchbar-search-icon {
      inset-inline-end: 16px;
      inset-inline-start: initial;
      top: 0 !important;
    }

    ion-icon {
      top: initial !important;
    }
    input {
      padding-top: 0 !important;
      text-align: right !important;
    }
  }
}

ion-searchbar {
  padding: 0;
}

#scroll-text {
  position: absolute;
  right: 20px;
  padding: 1rem;
  color: black;
  background: white;
  z-index: 1000;
}

:deep(ion-label) {
  z-index: 1;
  /* display: flex !important;
  align-items: center !important; */
  &.suffix {
    color: grey;
  }
}
:deep(ion-progress-bar) {
  position: absolute;
  height: 100%;
  border-radius: 0;

  :deep(&::part(track)) {
    background-color: transparent;
    opacity: 0.2;
  }
}

ion-title {
  .title {
    display: flex !important;
    align-items: center;

    ion-chip {
      margin-left: 0.5rem;
    }
  }
}

#cameraPreview {
  position: absolute;
  display: flex;
  justify-content: center;
  left: 25%;
  top: 25%;
  z-index: 1;
  width: 50%;
  height: 50%;
}
.overlay {
  position: absolute;
  display: flex;
  align-items: end;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
  bottom: 0;
  z-index: 1;
}

img {
  position: absolute;
  width: 50%;
  height: 50%;
}
</style>
