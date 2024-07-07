<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Résultats de la recherche') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="!covers.length"></div>
      <Carousel3d
        v-else
        :onMainSlideClick="onMainSlideClick"
        @after-slide-change="(index: number) => (cover = covers[index])"
      >
        <Slide
          v-for="(cover, index) in covers"
          :key="index"
          :index="index"
          :style="{ width: `min(50%, ${slideWidths[index]}px)` }"
        >
          <ion-img :src="getCoverUrl(cover.fullUrl)" @ion-img-did-load="setWidth" />
        </Slide>
      </Carousel3d>
      <ion-row
        class="ion-justify-content-between ion-align-items-center"
        style="position: relative; flex-direction: column"
        v-if="cover"
      >
        <ion-row><FullIssue :issue="cover" /></ion-row>
        <ion-row style="font-size: 0.8rem; width: 100%"
          ><ion-col size="2"><ion-icon :ios="personOutline" :android="personSharp" /></ion-col
          ><ion-col class="ion-text-left">1</ion-col></ion-row
        ><ion-row style="font-size: 0.8rem; width: 100%" v-if="cover.estimationMin || cover.estimationMax"
          ><ion-col size="2"><ion-icon :ios="pricetagOutline" :android="pricetagSharp"></ion-icon></ion-col
          ><ion-col class="ion-text-left"
            ><template v-if="cover.estimationMin && cover.estimationMax"
              ><template v-if="cover.estimationMax === cover.estimationMin">{{
                t('Environ {estimation} €', { estimation: cover.estimationMin })
              }}</template>
              <template v-else>{{ t('Entre {estimationMin} et {estimationMax} €', cover) }}</template></template
            ><template v-else-if="cover.estimationMin"> {{ t('Plus de {estimationMin} €', cover) }} </template
            ><template v-else>
              {{ t('Plus de {estimationMax} €', cover) }}
            </template></ion-col
          ></ion-row
        ></ion-row
      >
      <ion-note v-if="covers.length">
        <div style="white-space: pre; margin-bottom: 1rem">
          {{ t('Cliquez sur une couverture\npour ajouter le numéro à la collection') }}
        </div>
        <div>
          <div>{{ t('ou') }}&nbsp;</div>
          <ion-button v-if="origin === 'takePhoto'" @click="takePhoto">{{ t('Prenez une nouvelle photo') }}</ion-button>
          <ion-button v-else-if="origin === 'pickCoverFile'" @click="pickCoverFile">{{
            t('Sélectionnez une nouvelle photo')
          }}</ion-button>
        </div>
      </ion-note>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import '@nanoandrew4/vue3-carousel-3d/dist/style.css';
import { Carousel3d, Slide } from '@nanoandrew4/vue3-carousel-3d';
import { personOutline, personSharp, pricetagOutline, pricetagSharp } from 'ionicons/icons';
import type { EventReturnType } from '~socket.io-services/types';
import { stores as webStores } from '~web';

import useCoverSearch from '../composables/useCoverSearch';

import FullIssue from '~/components/FullIssue.vue';
import router from '~/router';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import type CoverIdServices from '~dm-services/cover-id/types';

const { t } = useI18n();
const { publicationNames } = storeToRefs(webStores.coa());
const { currentNavigationItem } = storeToRefs(app());

const cover = ref<(typeof covers)['value'][0]>();

const slideWidths = ref<number[]>([]);

const getCoverUrl = (url: string) => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${url}`;

const setWidth = (event: Event) => {
  slideWidths.value.push((event.target as HTMLImageElement).clientWidth + 32);
};

const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;

const { pickCoverFile, takePhoto } = useCoverSearch(useRouter(), coverIdServices);

const route = useRoute();

const { getCollectionIssues } = wtdcollection();

const searchResults = ref(
  JSON.parse(route.query.searchResults as string) as EventReturnType<CoverIdServices['searchFromCover']>,
);

const origin = computed(() => route.query.origin as 'pickCoverFile' | 'takePhoto');

const covers = computed(() =>
  Object.keys(publicationNames.value).length
    ? searchResults.value.covers.map((cover) => ({
        ...cover,
        countrycode: cover.publicationcode.split('/')[0],
        publicationName: publicationNames.value[cover.publicationcode],
        collectionIssues: getCollectionIssues(cover.publicationcode, cover.issuenumber),
      }))
    : [],
);

watch(covers, () => {
  cover.value = covers.value[0];
});

const onMainSlideClick = async ({ index }: { index: number }) => {
  currentNavigationItem.value = covers.value[index]!.shortIssuecode;
  router.push('/collection');
};
</script>
<style lang="scss" scoped>
ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 0 !important;
}

ion-note {
  text-align: center;
  display: flex;
  flex-direction: column;

  div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

ion-button {
  min-height: initial;
}

.carousel-3d-container {
  display: flex;
  align-items: center;
}

.carousel-3d.invisible {
  visibility: hidden;
}

:deep(.carousel-3d-slider) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-3d-slide {
  border-radius: 12px;
  overflow-x: auto;
  height: initial !important;
}
</style>
