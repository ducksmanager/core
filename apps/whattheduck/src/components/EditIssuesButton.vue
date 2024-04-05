<template>
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
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

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const pickCoverFile = async () => {
  const coverFile = await FilePicker.pickImages({ readData: true });
  if (coverFile.files.length) {
    // Create a FormData object
    const formData = new FormData();
    formData.append('image', coverFile.files[0].blob!);

    const response = await fetch('http://localhost:5000/search_image', {
      method: 'post',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // const response = await call(
    //   defaultApi,
    //   new POST__cover_id__search({
    //     reqBody: { base64: coverFile.files[0].data! },
    //   })
    // );
    console.log(response.body);
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
