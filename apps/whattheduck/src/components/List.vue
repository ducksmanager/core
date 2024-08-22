<template>
  <ion-content v-if="!items" ref="content">
    {{ t('Chargement...') }}
  </ion-content>
  <ion-content v-else-if="!items.length" ref="content">
    {{ t('Cette liste est vide.') }}
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
      <RecycleScroller
        :style="{ visibility: isCameraPreviewShown ? 'hidden' : 'visible' }"
        class="scroller"
        :items="filteredItems"
        :item-size="32"
        key-field="uniqueKey"
        item-class="item-wrapper"
        v-slot="{ item: { key, item, inducksItem, isOwned, nextItemType } }"
      >
        <Row
          :id="key"
          :type="itemType"
          :class="{ [`is-next-item-${nextItemType}`]: !!nextItemType, 'is-owned': isOwned }"
        >
          <template #fill-bar v-if="item">
            <slot name="fill-bar" :item="item" />
          </template>
          <template #prefix v-if="item">
            <slot name="row-prefix" :item="item" :inducks-item="inducksItem" />
          </template>
          <template #label>
            <slot name="row-label" :item="item" />
          </template>
          <template #suffix>
            <slot name="row-suffix" :item="item" />
          </template>
        </Row>
      </RecycleScroller>
      <div id="edit-issues-buttons" v-if="selectedIssuecodes">
        <EditIssuesConfirmCancelButtons
          :confirm-ios="pencilOutline"
          :confirm-md="pencilSharp"
          :cancel-ios="closeOutline"
          :cancel-md="closeSharp"
          @cancel="selectedIssuecodes = null"
          @confirm="updateNavigationToSelectedIssuecodes"
        /></div
    ></template>
    <slot v-else name="default" />
    <EditIssuesButton
      v-if="!selectedIssuecodes && !isCameraPreviewShown"
      @show-camera-preview="isCameraPreviewShown = true"
    />

    <template v-if="isCameraPreviewShown">
      <div :id="cameraPreviewElementId"></div>
      <div class="overlay" ref="overlay">
        <ion-button ref="takePhotoButton" @click="takePhoto().then(() => (isCameraPreviewShown = false))" size="large">
          <ion-icon :ios="apertureOutline" :md="apertureSharp" />
        </ion-button>
        <ion-button size="large" color="danger" @click="isCameraPreviewShown = false">
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

<script setup lang="ts" generic="Item extends Required<any>, InducksItem extends Required<any>">
import type { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraPreview } from '@capacitor-community/camera-preview';
import type { ScrollDetail } from '@ionic/vue';
import { IonContent, onIonViewWillLeave } from '@ionic/vue';
import { apertureOutline, apertureSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from 'ionicons/icons';

import useCoverSearch from '~/composables/useCoverSearch';
import { app } from '~/stores/app';

defineSlots<{
  'default'(): any;
  'fill-bar'(props: { item: Item }): any;
  'row-prefix'(props: { item: Item; inducksItem: InducksItem }): any;
  'row-label'(props: { item: Item }): any;
  'row-suffix'(props: { item: Item }): any;
}>();

const props = defineProps<{
  items: {
    key: string;
    item: Item;
    inducksItem?: InducksItem;
    isOwned?: boolean;
    nextItemType?: 'same' | 'owned' | undefined;
  }[];
  itemType: 'countrycode' | 'publicationcode' | 'issuecode';
  getItemTextFn: (item: Item) => string;
  issueViewModes?: { label: string; icon: { ios: string; md: string } }[];
  filter?: { label: string; icon: { ios: string; md: string } }[];
}>();

const emit = defineEmits<(e: 'items-filtered', items: string[]) => void>();

const overlay = ref<HTMLElement>();
const takePhotoButton = ref<{ $el: HTMLElement }>();

const {
  coverId: { services: coverIdServices },
} = inject(dmSocketInjectionKey)!;

const cameraPreviewElementId = 'camera-preview';
const { takePhoto } = useCoverSearch(useRouter(), coverIdServices);
const { isCameraPreviewShown, filterText, selectedIssuecodes, currentNavigationItem } = storeToRefs(app());

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
      console.log(boundingClientRect);

      if (boundingClientRect.height) {
        clearInterval(interval);
        const cameraPreviewOptions: CameraPreviewOptions = {
          parent: cameraPreviewElementId,
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

const content = ref<InstanceType<typeof IonContent> | null>(null);

const scrollPositionPct = ref(0);
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

const updateNavigationToSelectedIssuecodes = () => {
  if (selectedIssuecodes.value!.length) {
    currentNavigationItem.value = { type: 'issuecodes', value: selectedIssuecodes.value! };
  }
};

const itemInCenterOfViewport = computed(() => {
  if (!props.items.length) {
    return undefined;
  }
  const itemIndex = Math.floor((scrollPositionPct.value * props.items.length) / 100);
  return props.items[itemIndex].item;
});

const filteredItems = computed(() =>
  props.items
    .filter(({ item }) => props.getItemTextFn(item).toLowerCase().includes(filterText.value.toLowerCase()))
    .map((item, idx) => ({ ...item, uniqueKey: `item-${idx}` })),
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

onIonViewWillLeave(() => {
  isCameraPreviewShown.value = false;
});
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
  &.suffix {
    color: grey;
  }
}
:deep(ion-progress-bar) {
  position: absolute;
  height: 100%;
  border-radius: 0;

  :deep(&::part(progress)) {
    transition-duration: 0s !important;
  }

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
.overlay {
  align-items: end;
  text-align: center;
  height: 100%;

  ion-button {
    font-size: 2rem;
    margin-bottom: -1rem;
  }
}

.scroller {
  height: 100%;
}

img {
  position: absolute;
  width: 50%;
  height: 50%;
}

ion-fab {
  position: fixed;
  bottom: 8px;
}
</style>
