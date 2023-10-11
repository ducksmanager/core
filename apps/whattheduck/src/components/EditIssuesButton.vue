<template>
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button>
      <ion-icon :ios="pencilOutline" :md="pencilSharp" />
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-row class="ion-align-items-center" @click="pickCoverFile">
        <ion-label>{{ t('Depuis un fichier de couverture') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="imageOutline" :md="imageSharp" />
        </ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center" router-link="/add-from-camera">
        <ion-label>{{ t('Depuis une photo de couverture') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="cameraOutline" :md="cameraSharp" />
        </ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center" router-link="/recent">
        <ion-label>{{ t('Depuis un magazine récent') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="calendarOutline" :md="calendarSharp" />
        </ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center" @click="router.push({ path: route.path, query: { coa: 'true' } })">
        <ion-label>{{ t('Par sélection de numéro') }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="listOutline" :md="listSharp" />
        </ion-fab-button>
      </ion-row>
      <ion-row class="ion-align-items-center" router-link="/search">
        <ion-label>{{ t("Par titre d'histoire") }}</ion-label>
        <ion-fab-button size="small">
          <ion-icon :ios="searchOutline" :md="searchSharp" />
        </ion-fab-button>
      </ion-row>
    </ion-fab-list>
  </ion-fab>
</template>

<script setup lang="ts">
import { FilePicker } from '@capawesome/capacitor-file-picker';
import axios from 'axios';
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

    // Make the POST request with axios
    const response = await axios.post('http://localhost:5000/search_image', formData, {
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
    console.log(response.data);
  }
};
</script>

<style>
ion-fab-list {
  margin-left: -250px;
  align-items: end;
}
</style>
