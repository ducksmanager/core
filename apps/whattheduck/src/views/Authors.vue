<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Mes auteurs favoris') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-text class="ion-padding">{{
        t(
          'Ajoutez vos auteurs préférés et indiquez les notes que vous leur attribuez.\nGrâce à ces notes, What The Duck déterminera ensuite les magazines susceptibles de vous intéresser.',
        )
      }}</ion-text>

      <div v-if="ratings && !ratings.length" class="ion-padding">
        <ion-text color="warning">
          {{ t('Aucun auteur noté.') }}
        </ion-text>
      </div>
      <div v-if="personNames">
        <ion-row v-for="author in ratings" :key="author.personcode" align-v="center" class="mb-2">
          <ion-col lg="1">
            {{ personNames[author.personcode] }}
          </ion-col>
          <ion-col lg="2">
            <StarRating
              :readonly="appStore.isOfflineMode"
              v-model:rating="author.notation"
              :max-rating="10"
              @update:rating="statsStore.updateRating(author)"
              ><template #filledStarIcon><ion-icon :ios="starOutline" :android="starSharp" /></template
              ><template #emptyStarIcon><ion-icon :ios="star" :android="star" /></template
            ></StarRating>
          </ion-col>
          <ion-col lg="2">
            <ion-button @click="statsStore.deleteAuthor(author)">
              {{ t('Supprimer') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </div>

      <ion-searchbar v-model="authorName" :placeholder="t('Entrez le nom d\'un auteur')" />

      <ion-list v-if="authorResults">
        <ion-item
          v-for="(author, personcode) of authorResults"
          :class="{ disabled: statsStore.isAuthorWatched(personcode as string) }"
          @click="
            statsStore.createRating({
              personcode: personcode as string,
            });
            authorName = '';
          "
        >
          <ion-label>{{ author }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { stats } from '~web/src/stores/stats';
import { components } from '~web';
import { coa } from '~web/src/stores/coa';
import { app } from '~/stores/app';

import { starOutline, starSharp, star } from 'ionicons/icons';

const StarRating = components['StarRating'];

const { t } = useI18n();

const statsStore = stats();
const coaStore = coa();
const appStore = app();

const authorName = ref('');
const ratings = computed(() => statsStore.ratings);
const authorResults = computed(() => statsStore.authorSearchResults);
const personNames = computed(() => coaStore.personNames);

statsStore.loadRatings();

watch(
  () => authorName.value,
  (newValue) => {
    if (newValue) {
      statsStore.searchAuthors(newValue);
    }
  },
);

watch(
  () => ratings.value,
  async (newValue) => {
    if (newValue?.length) {
      await coa().fetchPersonNames(newValue.map(({ personcode }) => personcode));
    }
  },
  { immediate: true },
);
</script>
