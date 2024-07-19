<template>
  <ion-fab ref="fab" slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button>
      <ion-icon :ios="pencilOutline" :md="pencilSharp" />
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-item button class="ion-align-items-center ion-text-nowrap" @click="pickCoverFile">
        <ion-label>{{ t('Depuis un fichier de couverture') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="imageOutline" :md="imageSharp" />
        </ion-fab-button>
      </ion-item>
      <ion-item
        button
        class="ion-align-items-center ion-text-nowrap"
        @click="
          (fab?.$el as HTMLIonFabElement).close();
          emit('show-camera-preview');
        "
      >
        <ion-label>{{ t('Depuis une photo de couverture') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="cameraOutline" :md="cameraSharp" />
        </ion-fab-button>
      </ion-item>
      <ion-item button class="ion-align-items-center ion-text-nowrap" router-link="/recent">
        <ion-label>{{ t('Depuis un magazine récent') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="calendarOutline" :md="calendarSharp" />
        </ion-fab-button>
      </ion-item>
      <ion-item
        button
        class="ion-align-items-center ion-text-nowrap"
        @click="
          (fab?.$el as HTMLIonFabElement).close();
          isCoaView = true;
        "
      >
        <ion-label>{{ t('Par sélection de numéro') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="listOutline" :md="listSharp" />
        </ion-fab-button>
      </ion-item>
      <ion-item button class="ion-align-items-center ion-text-nowrap" router-link="/search">
        <ion-label>{{ t("Par titre d'histoire") }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="searchOutline" :md="searchSharp" />
        </ion-fab-button>
      </ion-item>
    </ion-fab-list>
  </ion-fab>
</template>

<script setup lang="ts">
import {
  pencilOutline,
  searchOutline,
  listOutline,
  cameraOutline,
  imageOutline,
  calendarOutline,
  pencilSharp,
  searchSharp,
  listSharp,
  cameraSharp,
  imageSharp,
  calendarSharp,
} from 'ionicons/icons';

import useCoverSearch from '../composables/useCoverSearch';

import { app } from '~/stores/app';

const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;

const emit = defineEmits<(e: 'show-camera-preview') => void>();

const { pickCoverFile } = useCoverSearch(useRouter(), coverIdServices);
const { isCoaView } = storeToRefs(app());

// eslint-disable-next-line no-undef
const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);

const { t } = useI18n();
</script>

<style lang="scss" scoped>
ion-fab {
  position: fixed;
  bottom: 8px;
  > ion-fab-button {
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }

  ion-fab-list {
    background: rgba(25, 25, 25, 0.85);
    border-radius: 1.5rem;
  }
}

ion-icon {
  fill: white;
}

ion-item {
  --inner-padding-end: 0;

  &::part(native) {
    background: transparent;
  }
}
</style>
