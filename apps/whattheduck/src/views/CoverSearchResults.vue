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
      <ion-modal v-if="selectedCover" :is-open="selectedCover !== null">
        <OwnedIssueCopiesModal
          @cancel="selectedCover = null"
          :publicationcode="selectedCover.publicationcode"
          :issuenumber="selectedCover.issuenumber"
          :fullUrl="selectedCover.fullUrl"
        />
      </ion-modal>
      <div v-if="!covers.length"></div>
      <Carousel3d :loop="false" v-else :onMainSlideClick="onMainSlideClick">
        <Slide
          v-for="(cover, index) in covers"
          :key="index"
          :index="index"
          :style="{ width: `${slideWidths[index]}px` }"
        >
          <ion-card>
            <ion-img :src="getCoverUrl(cover.fullUrl)" />
            <ion-card-header :ref="(el: ComponentPublicInstance) => addSlideElement(index, el.$el)">
              <ion-card-title class="ion-align-items-center"
                ><ion-row class="ion-justify-content-between"
                  ><ion-col style="display: flex" size="9"><FullIssue :issue="cover" /></ion-col
                  ><ion-col
                    style="display: flex; font-size: 0.8rem; flex-direction: column"
                    size="3"
                    class="ion-justify-content-center ion-align-items-end issue-details"
                    ><ion-row
                      ><ion-col><ion-icon :ios="bookOutline" :android="bookSharp" /></ion-col
                      ><ion-col
                        ><Condition
                          v-if="cover.collectionIssues.length"
                          v-for="issue of cover.collectionIssues"
                          no-margin
                          :value="issue.condition" /><Condition v-else no-margin /></ion-col></ion-row
                    ><ion-row
                      ><ion-col><ion-icon :ios="personOutline" :android="personSharp" /></ion-col
                      ><ion-col class="ion-text-left">1</ion-col></ion-row
                    ><ion-row
                      ><ion-col><ion-icon :ios="pricetagOutline" :android="pricetagSharp"></ion-icon></ion-col
                      ><ion-col class="ion-text-left">1€</ion-col></ion-row
                    ></ion-col
                  ></ion-row
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
import { personOutline, personSharp, pricetagOutline, pricetagSharp, bookOutline, bookSharp } from 'ionicons/icons';
import type { ComponentPublicInstance } from 'vue';
import type { EventReturnType } from '~socket.io-services/types';
import { stores as webStores } from '~web';

import useCoverSearch from '../composables/useCoverSearch';

import FullIssue from '~/components/FullIssue.vue';
import OwnedIssueCopiesModal from '~/components/OwnedIssueCopiesModal.vue';
import { wtdcollection } from '~/stores/wtdcollection';
import type CoverIdServices from '~dm-services/cover-id/types';

const { t } = useI18n();
const { publicationNames } = storeToRefs(webStores.coa());

const slideWidths = ref<number[]>([]);

const selectedCover = ref<(typeof covers.value)[0] | null>(null);

const getCoverUrl = (url: string) => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${url}`;

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

const { getCollectionIssues } = wtdcollection();

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
        collectionIssues: getCollectionIssues(cover.publicationcode, cover.issuenumber),
      }))
    : [],
);

const onMainSlideClick = async ({ index }: { index: number }) => {
  selectedCover.value = covers.value[index]!;
};
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

  ion-card-header {
    position: absolute;
    bottom: 0;
    background: rgba(30, 30, 30, 0.75);
    padding: 4px;

    ion-card-title {
      display: inline-flex;
      font-size: initial;
      white-space: nowrap;

      .issue-details {
        padding: 0;
        width: 46px !important;
        max-width: 46px !important;
        font-weight: normal;
        color: grey;

        > ion-row {
          display: flex;
          align-items: center;
          justify-content: end;
          width: 100%;

          ion-col {
            display: flex;
            padding: 1px 2px;
            flex-grow: 0;
            min-width: 50%;
            max-width: 50%;

            &:first-child {
              text-align: right;
            }
          }
        }
      }
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
