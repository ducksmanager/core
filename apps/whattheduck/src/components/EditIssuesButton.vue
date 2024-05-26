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
      <ion-item button class="ion-align-items-center ion-text-nowrap" @click="takePhoto">
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
          router.push({ path: route.path, query: { coa: 'true' } });
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

const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;
const { pickCoverFile, takePhoto } = useCoverSearch(useRouter(), coverIdServices);

// eslint-disable-next-line no-undef
const fab = ref<ComponentPublicInstance<HTMLIonFabElement> | null>(null);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
</script>

<style lang="scss" scoped>
ion-fab-button {
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}

ion-fab-list {
  width: 360px;
}
</style>
