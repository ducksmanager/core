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
      <ion-item button class="ion-align-items-center ion-text-nowrap" router-link="/add-from-camera">
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
        @click="router.push({ path: route.path, query: { coa: 'true' } })"
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
import { FilePicker } from '@capawesome/capacitor-file-picker';
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
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

const fab = ref<HTMLIonFabElement | null>(null);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;

const pickCoverFile = async () => {
  const coverFile = await FilePicker.pickImages({ readData: true });
  if (coverFile.files.length) {
    const reader = new FileReader();
    reader.onload = function (event) {
      coverIdServices.searchFromCover({ base64: event.target!.result?.toString() }).then((results) => {
        router.push({ path: '/cover-search-results', query: { searchResults: JSON.stringify(results) } });
      });
    };
    reader.readAsDataURL(coverFile.files[0].blob!);
  }
};
</script>

<style lang="scss">
ion-fab-button {
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}

ion-fab-list {
  right: 0;
  width: 360px;
  align-items: end;

  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 1rem;

  ion-item {
    background: inherit;
    width: 100%;
  }
}
</style>
