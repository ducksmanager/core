<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>Find a story</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-text>{{
        t(
          "Entrez le titre d'une histoire. What The Duck vous indiquera les magazines qui contiennent cette histoire et précisera les histoires et magazines correspondants que vous possédez.",
        )
      }}</ion-text>
      <ion-searchbar v-model="storyTitle" :placeholder="t('Entrez le titre d\'une histoire')" />

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
        {{ selectedStory.title }} {{ t('a été publiée dans les numéros suivants :') }}
        <div v-for="issue of selectedStory.issues">
          <Country :countrycode="issue.countrycode" :countryname="issue.countryname" /><condition
            v-if="issue.collectionIssue"
            :value="getConditionText(issue.collectionIssue.condition)"
          />
          {{ issue.publicationName }}
          {{ issue.issuenumber }}
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { POST__coa__stories__search__withIssues } from '~api-routes';
import { call } from '~axios-helper';
import type { SimpleIssue } from '~dm-types/SimpleIssue';
import type { SimpleStory } from '~dm-types/SimpleStory';
import { stores } from '~web';

import { defaultApi } from '~/api';
import { getConditionText } from '~/composables/useCondition';
import type { Issue } from '~/persistence/models/dm/Issue';
import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();

const collectionStore = wtdcollection();
const coaStore = stores.coa();

const storyTitle = ref('' as string);
const storyResults = ref(null as { results: any[] } | null);

const selectedStory = ref(
  null as
    | (SimpleStory & {
        issues: (SimpleIssue & {
          countrycode: string;
          countryname: string;
          publicationName: string;
          collectionIssue: Issue | null;
        })[];
      })
    | null,
);

watch(
  () => storyTitle.value,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    selectedStory.value = null;
    const data = (
      await call(
        defaultApi,
        new POST__coa__stories__search__withIssues({
          reqBody: { keywords: newValue },
        }),
      )
    ).data.results;

    const publicationcodes = [
      ...new Set(
        data.reduce(
          (acc, story) => [...acc, ...(story.issues?.map(({ publicationcode }) => publicationcode) || [])],
          [] as string[],
        ),
      ),
    ];
    await coaStore.fetchPublicationNames(publicationcodes);

    storyResults.value = {
      results: data.map((story) => ({
        ...story,
        issues: story.issues?.map(({ publicationcode, issuenumber }) => ({
          publicationcode,
          countrycode: publicationcode.split('/')[0],
          publicationName: coaStore.publicationNames[publicationcode] || publicationcode,
          issuenumber,
          collectionIssue:
            collectionStore.issues!.find(
              ({ publicationcode: collectionPublicationCode, issuenumber: collectionIssueNumber }) =>
                collectionPublicationCode === publicationcode && collectionIssueNumber === issuenumber,
            ) || null,
        })),
      })),
    };
  },
);

collectionStore.loadCollection();
coaStore.fetchCountryNames();
</script>

<style scoped>
ion-item {
  cursor: pointer;
}
</style>
