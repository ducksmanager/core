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
      <ion-searchbar
        autocapitalize="sentences"
        v-model="storyTitle"
        :placeholder="t('Entrez le titre d\'une histoire')"
      />

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
          <FullIssue :issue="issue" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { SimpleStory } from '~dm-types/SimpleStory';
import { stores } from '~web';

import { wtdcollection } from '~/stores/wtdcollection';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';
import FullIssue from './FullIssue.vue';
import type { IssueWithCollectionIssues } from '~/stores/wtdcollection';

const {
  coa: { services: coaServices },
} = injectLocal(dmSocketInjectionKey)!;

const { t } = useI18n();

const { getCollectionIssues } = wtdcollection();
const coaStore = stores.coa();

const storyTitle = ref('' as string);
const storyResults = ref(null as { results: any[] } | null);

const selectedStory = ref(
  null as
    | (SimpleStory & {
        issues: IssueWithCollectionIssues[];
      })
    | null,
);

watch(storyTitle, async (newValue) => {
  if (!newValue) {
    return;
  }
  selectedStory.value = null;
  const { results: data } = await coaServices.searchStory([newValue], true);

  storyResults.value = {
    results: data.map((story) => ({
      ...story,
      issues: story.issues?.map(({ publicationcode, issuenumber }) => ({
        publicationcode,
        countrycode: publicationcode.split('/')[0],
        publicationName: coaStore.publicationNames[publicationcode] || publicationcode,
        issuenumber,
        collectionIssues: getCollectionIssues(publicationcode, issuenumber),
      })),
    })),
  };
});
</script>

<style scoped>
ion-item {
  cursor: pointer;
}
</style>
