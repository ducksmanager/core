<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Rechercher une histoire') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-text>{{
        t(
          "Entrez le titre d'une histoire. What The Duck vous indiquera les magazines qui contiennent cette histoire et précisera les histoires et magazines correspondants que vous possédez.",
        )
      }}</ion-text>
      <ion-searchbar
        style="margin: 1rem 0"
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
          <ion-label
            ><condition v-for="condition of story.collectionConditions" :value="condition" />{{
              story.title
            }}</ion-label
          >
        </ion-item>
      </ion-list>
      <template v-if="selectedStory">
        <div style="margin: 1rem 0">{{ selectedStory.title }} {{ t('a été publiée dans les numéros suivants :') }}</div>
        <ion-list>
          <ion-item
            v-for="issue of selectedStory.issues"
            @click="
              currentNavigationItem = issue.issuecode;
              router.push('/collection');
            "
          >
            <FullIssue :issue="issue" />
          </ion-item>
        </ion-list>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { StorySearchResults } from '~dm-types/StorySearchResults';
import { stores } from '~web';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import FullIssue from '~/components/FullIssue.vue';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import type { IssueWithCollectionIssues } from '~/stores/wtdcollection';

const {
  coa: { services: coaServices },
} = injectLocal(dmSocketInjectionKey)!;

const { t } = useI18n();

const { issuesByIssueCode } = storeToRefs(wtdcollection());
const coaStore = stores.coa();
const { fetchPublicationNames } = coaStore;
const { publicationNames } = storeToRefs(coaStore);
const { currentNavigationItem } = storeToRefs(app());
const router = useRouter();

type StoryResult = StorySearchResults['results'][number];
type AugmentedStoryResult = {
  issues: Pick<NonNullable<StoryResult['issues']>[number], 'publicationcode' | 'issuenumber' | 'issuecode'> & {
    countrycode: string;
    publicationName: string;
    collectionIssues: IssueWithCollectionIssues['collectionIssues'];
  };
};

const storyTitle = ref('');
const storyResults = ref(null as { results: AugmentedStoryResult[] } | null);

const selectedStory = ref(null as AugmentedStoryResult | null);

watch(storyTitle, async (newValue) => {
  if (!newValue) {
    return;
  }
  selectedStory.value = null;
  const { results: data } = await coaServices.searchStory([newValue], true);

  await fetchPublicationNames(
    data
      .map((story) => story.issues!)
      .flat()
      .map(({ publicationcode }) => publicationcode),
  );

  storyResults.value = {
    results: data.map((story) => {
      const collectionIssues = story.issues!.map(
        ({ issuecode }) => issuesByIssueCode.value![issuecode.replace(/ +/g, ' ')] || [],
      );
      const collectionConditions = collectionIssues.flat().map(({ condition }) => condition);
      return {
        ...story,
        collectionConditions,
        issues: story.issues?.map(({ publicationcode, issuenumber, issuecode }, idx) => ({
          publicationcode,
          countrycode: publicationcode.split('/')[0],
          publicationName: publicationNames.value[publicationcode] || publicationcode,
          issuenumber,
          issuecode,
          collectionIssues: collectionIssues[idx],
        })),
      };
    }),
  };
});
</script>

<style scoped>
ion-item {
  cursor: pointer;
}
</style>
