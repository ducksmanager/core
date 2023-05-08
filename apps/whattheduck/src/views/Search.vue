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
        <ion-item>Type the title of a story.</ion-item>
        <ion-searchbar placeholder="Story title" v-model="storyTitle"></ion-searchbar>

        <ion-list>
          <ion-item v-for="{ title } of storyResults">
            <ion-label>{{ title }}</ion-label>
          </ion-item>
        </ion-list>
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
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import axios from 'axios';
import { POST__coa__stories__search__withIssues } from 'ducksmanager/types/routes';
import { call } from '~/axios-helper';
import { ref, watch } from 'vue';
import { coa } from '~/stores/coa';
import { collection } from '~/stores/collection';

const collectionStore = collection();

const storyTitle = ref('' as string);
const storyResults = ref(null as { results: any[] } | null);

watch(
  () => storyTitle.value,
  async (newValue) => {
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
</script>

<style scoped></style>
