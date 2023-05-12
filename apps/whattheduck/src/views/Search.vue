<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Find a story</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <ion-text>{{ t('search_intro') }}</ion-text>
        <ion-searchbar :placeholder="t('search_hint')" v-model="storyTitle"></ion-searchbar>

        <ion-list v-if="storyResults?.results && !selectedStory">
          <ion-item
            v-for="story of storyResults?.results"
            @click="
              selectedStory = story;
              storyTitle = '';
            "
          >
            <ion-label>{{ story.title }}</ion-label>
          </ion-item>
        </ion-list>
        <div v-if="selectedStory">
          {{ selectedStory.title }} {{ t('story_was_published_in') }}
          <div v-for="issue of selectedStory.issues">{{ issue.publicationcode }} {{ issue.issuenumber }}</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonText,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import axios from 'axios';
import { POST__coa__stories__search__withIssues } from 'ducksmanager/types/routes';
import { SimpleStory } from 'ducksmanager/types/SimpleStory';
import { call } from '~/axios-helper';
import { ref, watch } from 'vue';
import { coa } from '~/stores/coa';
import { collection } from '~/stores/collection';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const collectionStore = collection();
const coaStore = coa();

const storyTitle = ref('' as string);
const storyResults = ref(null as { results: any[] } | null);

const selectedStory = ref(null as SimpleStory | null);

watch(
  () => storyTitle.value,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    selectedStory.value = null;
    const data = (
      await call(
        axios,
        new POST__coa__stories__search__withIssues({
          reqBody: { keywords: newValue },
        })
      )
    ).data;
    storyResults.value = {
      results: data.results.map((story) => ({
        ...story,
        collectionIssue:
          collectionStore.collection!.find(
            ({ publicationcode: collectionPublicationCode, issuenumber: collectionIssueNumber }) =>
              story
                .issues!.map(({ publicationcode, issuenumber }) => `${publicationcode}-${issuenumber}`)
                .includes(`${collectionPublicationCode}-${collectionIssueNumber}`)
          ) || null,
      })),
    };
  }
);

collectionStore.loadCollection();
coaStore.fetchCountryNames();
</script>

<style scoped>
ion-item {
  cursor: pointer;
}
</style>
