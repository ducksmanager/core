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
      <Carousel3d :loop="false" :on-main-slide-click="test" v-else>
        <Slide
          v-for="(cover, index) in covers"
          :key="index"
          :index="index"
          :style="{ width: `${slideWidths[index]}px` }"
        >
          <ion-card>
            <ion-img :src="`${cloudinaryBaseUrl}${cover.fullUrl}`" />
            <ion-card-header :ref="(el) => addSlideElement(index, (el as ComponentPublicInstance).$el)">
              <ion-card-title class="ion-align-items-center"
                ><ion-row
                  ><FullIssue :issue="cover" /><ion-col size="2" class="ion-text-right">Details</ion-col></ion-row
                ></ion-card-title
              >
            </ion-card-header>
          </ion-card>
        </Slide>
      </Carousel3d>
      <ion-note
        ><div style="white-space: pre; margin-bottom: 1rem">
          {{ t('Cliquez sur une couverture\npour ajouter le numéro à la collection') }}
        </div>
        <div>
          <div>{{ t('ou') }}&nbsp;</div>
          <ion-button v-if="origin === 'takePhoto'" @click="takePhoto">{{ t('Prenez une nouvelle photo') }}</ion-button>
          <ion-button v-else-if="origin === 'pickCoverFile'" @click="pickCoverFile">{{
            t('Sélectionnez une nouvelle photo')
          }}</ion-button>
        </div></ion-note
      >
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import '@nanoandrew4/vue3-carousel-3d/dist/style.css';
import { Carousel3d, Slide } from '@nanoandrew4/vue3-carousel-3d';
import CoverIdServices from '~dm-services/cover-id/types';

import { EventReturnType } from '~socket.io-services/types';
import { wtdcollection } from '~/stores/wtdcollection';
import useCoverSearch from '../composables/useCoverSearch';

import { stores as webStores } from '~web';
import FullIssue from './FullIssue.vue';
import { ComponentPublicInstance } from 'vue';

const { publicationNames } = storeToRefs(webStores.coa());

const slideWidths = ref<number[]>([]);

const addSlideElement = (idx: number, el: HTMLElement) => {
  new ResizeObserver(function () {
    slideWidths.value[idx] = el.clientWidth + 32;
  }).observe(el);
};

const {
  coverId: { services: coverIdServices },
} = injectLocal(dmSocketInjectionKey)!;

const { pickCoverFile, takePhoto } = useCoverSearch(useRouter(), coverIdServices);

const route = useRoute();

const cloudinaryBaseUrl = 'https://res.cloudinary.com/dl7hskxab/image/upload/f_auto/inducks-covers/';

const { getCollectionIssue } = wtdcollection();

const searchResults = computed(
  () => JSON.parse(route.query.searchResults as string) as EventReturnType<CoverIdServices['searchFromCover']>,
);

const origin = computed(() => route.query.origin as 'pickCoverFile' | 'takePhoto');

const covers = computed(() =>
  Object.keys(publicationNames.value).length
    ? searchResults.value.covers.map((cover) => ({
        ...cover,
        code: cover.issuecode,
        countrycode: cover.publicationcode.split('/')[0],
        publicationName: publicationNames.value[cover.publicationcode],
        collectionIssue: getCollectionIssue(cover.publicationcode, cover.issuenumber),
      }))
    : [],
);

const test = () => {
  console.log('!');
};

const { t } = useI18n();
</script>
<style lang="scss" scoped>
ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

ion-card {
  $margin: 8;
  height: calc(100% - #{$margin * 2}px);
  border-radius: #{$margin}px;
  margin-inline: #{$margin}px;
  margin-top: #{$margin}px;
  display: flex;
  flex-direction: column;
  align-items: center;

  ion-img {
    max-height: 100%;
    max-width: 100%;
  }

  ion-card-title {
    font-size: initial;
    white-space: nowrap;
  }

  ion-card-header {
    position: absolute;
    bottom: 0;
    background: rgba(30, 30, 30, 0.75);

    ion-card-title {
      display: inline-flex;
    }
  }
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
  width: 100%;
  overflow-x: auto;
}
</style>
