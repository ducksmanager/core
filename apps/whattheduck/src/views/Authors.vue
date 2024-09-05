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
      <ion-text
        ><i18n-t
          tag="span"
          keypath="Ajoutez vos auteurs préférés et indiquez les notes que vous leur attribuez.{br}Grâce à ces notes, What The Duck déterminera ensuite les magazines susceptibles de vous intéresser."
        >
          <template #br>
            <br />
          </template>
        </i18n-t>
      </ion-text>
      <div v-if="ratings && !ratings.length" class="ion-padding">
        <ion-text color="warning">
          {{ t('Aucun auteur noté.') }}
        </ion-text>
      </div>
      <div v-if="personNames">
        <ion-row v-for="author in ratings" :key="author.personcode" class="mb-2 ion-align-items-center">
          <ion-col size="4">
            {{ personNames[author.personcode] }}
          </ion-col>
          <ion-col size="5">
            <StarRating
              :readonly="isOfflineMode"
              v-model:rating="author.notation"
              :max-rating="10"
              @update:rating="updateRating(author)"
              ><template #filledStarIcon><ion-icon style="width: 10%" :ios="starOutline" :md="starSharp" /></template
              ><template #emptyStarIcon><ion-icon style="width: 10%" :ios="star" :md="star" /></template
            ></StarRating>
          </ion-col>
          <ion-col size="3">
            <ion-button v-if="!isOfflineMode" @click="deleteAuthor(author.personcode)">
              {{ t('Supprimer') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </div>

      <ion-searchbar
        v-if="!isOfflineMode"
        autocapitalize="words"
        v-model="authorName"
        :placeholder="t('Entrez le nom d\'un auteur')"
      />

      <ion-list v-if="authorResults">
        <ion-item
          v-for="(author, personcode) of authorResults"
          :class="{ disabled: isAuthorWatched(personcode) }"
          @click="
            createRating(personcode);
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
import { starOutline, starSharp, star } from 'ionicons/icons';
import { components } from '~web';
import { coa } from '~web/src/stores/coa';
import { stats } from '~web/src/stores/stats';

import { app } from '~/stores/app';

const StarRating = components['StarRating'];

const { t } = useI18n();

const { loadRatings, searchAuthors, isAuthorWatched, createRating, updateRating, deleteAuthor } = stats();
const { authorSearchResults: authorResults, ratings } = storeToRefs(stats());
const { personNames } = storeToRefs(coa());
const { isOfflineMode } = storeToRefs(app());

const authorName = ref('');

loadRatings();

watch(authorName, (newValue) => {
  if (newValue) {
    searchAuthors(newValue);
  }
});

watch(
  ratings,
  async (newValue) => {
    if (newValue?.length) {
      await coa().fetchPersonNames(newValue.map(({ personcode }) => personcode));
    }
  },
  { immediate: true },
);
</script>
<style lang="scss">
ion-button {
  align-content: center;
}
</style>
