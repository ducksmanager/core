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
      <template v-else>
        <div>
          <Carousel3d @after-slide-change="(index: number) => (cover = covers[index])">
            <Slide
              v-for="(cover, index) in covers"
              :key="index"
              :index="index"
              :style="{ width: `min(50%, ${slideWidths[index]}px)` }"
            >
              <ion-img :src="getCoverUrl(cover.fullUrl!)" @ion-img-did-load="setWidth" />
            </Slide>
          </Carousel3d>
          <ion-row
            class="ion-justify-content-between ion-align-items-center"
            style="position: relative; flex-direction: column"
            v-if="hasCoaData && cover"
          >
            <ion-row><FullIssue :issuecode="cover.issuecode" show-issue-conditions /></ion-row>
            <ion-row style="font-size: 0.8rem; width: 100%"
              ><ion-col class="ion-text-left">{{
                t('{numberOfUsers} utilisateurs possèdent ce numéro', {
                  numberOfUsers: issuePopularities[cover.issuecode]!.popularity,
                })
              }}</ion-col></ion-row
            ><ion-row style="font-size: 0.8rem; width: 100%" v-if="getEstimationWithAverage(cover.issuecode)"
              ><ion-col size="2"><ion-icon :ios="pricetagOutline" :md="pricetagSharp"></ion-icon></ion-col
              ><ion-col class="ion-text-left"
                ><IssueQuotation :issue="getEstimationWithAverage(cover.issuecode)" /></ion-col></ion-row
          ></ion-row>
        </div>
        <ion-note>
          <ion-button @click="onCurrentCoverClick"
            ><template v-if="cover?.collectionIssues.length">{{ t('Modifier mes exemplaires') }}</template
            ><template v-else>{{ t('Ajouter à ma collection') }}</template></ion-button
          >
          <div>
            <ion-button color="light" v-if="coverOrigin === 'takePhoto'" @click="takePhoto">{{
              t('Prendre une nouvelle photo')
            }}</ion-button>
            <ion-button color="light" v-else-if="coverOrigin === 'pickCoverFile'" @click="pickCoverFile">{{
              t('Sélectionner une nouvelle photo')
            }}</ion-button>
          </div>
        </ion-note></template
      >
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import '@nanoandrew4/vue3-carousel-3d/dist/style.css';
import { Carousel3d, Slide } from '@nanoandrew4/vue3-carousel-3d';
import { pricetagOutline, pricetagSharp } from 'ionicons/icons';
import type { EventReturnType } from '~socket.io-services/types';
import { stores as webStores, components as webComponents } from '~web';
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import useCoverSearch from '../composables/useCoverSearch';

import FullIssue from '~/components/FullIssue.vue';
import router from '~/router';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import type CoverIdServices from '~dm-services/cover-id/types';

const { t } = useI18n();
const hasCoaData = ref(false);
const { issuecodeDetails, publicationNames, issuePopularities } = storeToRefs(webStores.coa());
const {
  fetchPublicationNames,
  fetchIssuecodeDetails,
  fetchIssuePopularities,
  fetchIssueQuotations,
  getEstimationWithAverage,
} = webStores.coa();
const { currentNavigationItem } = storeToRefs(app());

const { IssueQuotation } = webComponents;

const cover = shallowRef<(typeof covers)['value'][0]>();

const slideWidths = ref<number[]>([]);

const getCoverUrl = (url: string) => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${url}`;

const setWidth = (event: Event) => {
  slideWidths.value.push((event.target as HTMLImageElement).clientWidth + 32);
};

const {
  coverId: { services: coverIdServices },
} = inject(dmSocketInjectionKey)!;

const { pickCoverFile, takePhoto } = useCoverSearch(useRouter(), coverIdServices);

const route = useRoute();

const { getCollectionIssues } = wtdcollection();

const searchResults = ref<EventReturnType<CoverIdServices['searchFromCover']>>(
  JSON.parse(route.query.searchResults as string),
);

const coverOrigin = computed(() => route.query.origin as 'pickCoverFile' | 'takePhoto');

const covers = computed(() =>
  Object.keys(publicationNames.value).length
    ? searchResults.value.covers.map((cover) => ({
        ...cover,
        collectionIssues: getCollectionIssues(cover.issuecode),
      }))
    : [],
);

watch(
  searchResults,
  async () => {
    const issuecodes = searchResults.value.covers.map((cover) => cover.issuecode);
    await fetchIssuePopularities(issuecodes);
    await fetchIssueQuotations(issuecodes);
    await fetchIssuecodeDetails(issuecodes);
    await fetchPublicationNames(
      searchResults.value.covers.map(({ issuecode }) => issuecodeDetails.value[issuecode].publicationcode),
    );
    hasCoaData.value = true;
  },
  { immediate: true },
);

watch(
  covers,
  () => {
    cover.value = covers.value[0];
  },
  { immediate: true },
);

const onCurrentCoverClick = async () => {
  currentNavigationItem.value = { type: 'issuecodes', value: [cover.value!.issuecode] };
  await router.push('/collection');
};
</script>
<style lang="scss" scoped>
ion-content {
  display: flex;
  --offset-top: 0px !important;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
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
