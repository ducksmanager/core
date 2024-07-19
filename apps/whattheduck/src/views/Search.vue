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
        <ion-item v-for="story of storyResults?.results" @click="selectedStory = story">
          <ion-label>
            <condition v-for="condition of story.collectionConditions" :value="condition" />{{ story.title }}
          </ion-label>
        </ion-item>
      </ion-list>
      <template v-if="selectedStory">
        <div style="margin: 1rem 0">
          <b>{{ selectedStory.title }}</b> {{ t('a été publiée dans les numéros suivants :') }}
        </div>
        <ion-button size="small" @click="selectedStory = null"
          >&nbsp;<ion-icon :md="arrowBackSharp" :ios="arrowBackOutline"></ion-icon
          >{{ t("Retour aux résultats d'histoire") }}</ion-button
        >
        <ion-list>
          <ion-item
            v-for="issue of selectedStory.issues"
            @click="
              currentNavigationItem = issue.shortIssuecode;
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
import { arrowBackOutline, arrowBackSharp } from 'ionicons/icons';
import type { SimpleStory } from '~dm-types/SimpleStory';
import type { StorySearchResults } from '~dm-types/StorySearchResults';
import type { issue_condition } from '~prisma-clients/client_dm';
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

const { issuesByShortIssuecode } = storeToRefs(wtdcollection());
const coaStore = stores.coa();
const { fetchPublicationNames } = coaStore;
const { publicationNames } = storeToRefs(coaStore);
const { currentNavigationItem } = storeToRefs(app());
const router = useRouter();

type AugmentedStoryResult = SimpleStory & {
  collectionConditions: issue_condition[];
  issues: {
    countrycode: string;
    publicationName: string;
    collectionIssues: IssueWithCollectionIssues['collectionIssues'];
  }[];
};

const storyTitle = ref('');
const storyResults = ref<{ results: AugmentedStoryResult[] } | null>(null);

const selectedStory = ref<AugmentedStoryResult | null>(null);

watch(storyTitle, async (newValue) => {
  if (!newValue) {
    return;
  }
  selectedStory.value = null;
  const { results: data }: StorySearchResults<true> = await coaServices.searchStory([newValue], true);

  await fetchPublicationNames(
    data
      .map((story) => story.issues)
      .flat()
      .map(({ publicationcode }) => publicationcode),
  );

  storyResults.value = {
    results: data.map((story) => {
      const collectionIssues = story.issues.map((storyIssue) => {
        const { part, estimatedpanels, total_estimatedpanels } = storyIssue;
        return (issuesByShortIssuecode.value![storyIssue.shortIssuecode] || []).map((issue) => ({
          ...issue,
          partInfo: { part, estimatedpanels, total_estimatedpanels },
        }));
      });

      const collectionConditions = collectionIssues.flat().map(({ condition }) => condition);
      return {
        ...story,
        collectionConditions,
        issues: story.issues.map(
          (
            {
              publicationcode,
              issuenumber,
              shortIssuecode,
              estimatedpanels,
              total_estimatedpanels,
              part,
              storyversioncode,
            },
            idx,
          ) => ({
            publicationcode,
            countrycode: publicationcode.split('/')[0],
            publicationName: publicationNames.value[publicationcode] || publicationcode,
            issuenumber,
            shortIssuecode,
            collectionIssues: collectionIssues[idx]!,
            partInfo: {
              estimatedpanels,
              total_estimatedpanels,
              part,
              storyversioncode,
            },
          }),
        ),
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
