<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ $t('Rechercher une histoire') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-text>
        {{
          $t(
            "Entrez le titre d'une histoire. What The Duck vous indiquera les magazines qui contiennent cette histoire et précisera les histoires et magazines correspondants que vous possédez.",
          )
        }}
      </ion-text>
      <ion-searchbar
        v-model="storyTitle"
        style="margin: 1rem 0"
        autocapitalize="sentences"
        :placeholder="$t('Entrez le titre d\'une histoire')"
      />

      <ion-list v-if="storyResults?.results && !selectedStory">
        <ion-item v-for="story of storyResults?.results" :key="story.storycode" @click="selectedStory = story">
          <ion-label>
            <template v-for="{ collectionIssues, partInfo } of story.issues">
              <condition-with-part
                v-for="{ condition } of collectionIssues"
                :key="condition"
                :value="condition"
                :part-info="partInfo" /></template
            >{{ story.title }}
          </ion-label>
        </ion-item>
      </ion-list>
      <template v-if="selectedStory">
        <div style="margin: 1rem 0">
          <b>{{ selectedStory.title }}</b> {{ $t('a été publiée dans les numéros suivants :') }}
        </div>
        <ion-button size="small" @click="selectedStory = undefined"
          >&nbsp;<ion-icon :md="arrowBackSharp" :ios="arrowBackOutline"></ion-icon
          >{{ $t("Retour aux résultats d'histoire") }}</ion-button
        >
        <ion-list>
          <ion-item
            v-for="{ issuecode, partInfo } of selectedStory.issues"
            :key="issuecode"
            @click="goToIssue(issuecode)"
          >
            <FullIssue :issuecode="issuecode" show-issue-conditions :part-info="partInfo" />
          </ion-item>
        </ion-list>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, arrowBackSharp } from 'ionicons/icons';
import type { EntryPartInfo } from '~dm-types/EntryPartInfo';
import type { SimpleStory } from '~dm-types/SimpleStory';
import type { StorySearchResults } from '~dm-types/StorySearchResults';
import type { issue_condition } from '~prisma-schemas/schemas/dm';
import { stores } from '~web';
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import FullIssue from '~/components/FullIssue.vue';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const { issuesByIssuecode: collectionIssuesByIssuecode } = storeToRefs(wtdcollection());
const coaStore = stores.coa();
const { fetchPublicationNames, fetchIssuecodeDetails } = coaStore;
const { issuecodeDetails } = storeToRefs(coaStore);
const { currentNavigationItem } = storeToRefs(app());
const router = useRouter();

type AugmentedStoryResult = Omit<SimpleStory, 'issues'> & {
  issues: {
    issuecode: string;
    collectionIssues: { condition: issue_condition }[];
    partInfo: EntryPartInfo;
  }[];
};

const storyTitle = ref('');
const storyResults = ref<{ results: AugmentedStoryResult[] }>();

const selectedStory = ref<AugmentedStoryResult>();

const goToIssue = (issuecode: string) => {
  currentNavigationItem.value = { type: 'issuecodes', value: [issuecode] };
  router.push('/collection');
};

watchDebounced(
  storyTitle,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    selectedStory.value = undefined;
    const { results: data } = (await coaEvents.searchStory([newValue], {
      withIssues: true,
    })) as StorySearchResults<true>;

    const issuecodes = data
      .map((story) => story.issues)
      .flat()
      .map(({ issuecode }) => issuecode);

    await fetchIssuecodeDetails(issuecodes);

    await fetchPublicationNames(issuecodes.map((issuecode) => issuecodeDetails.value![issuecode]?.publicationcode));

    storyResults.value = {
      results: data.map((story) => ({
        ...story,
        issues: story.issues.map(({ part, estimatedpanels, total_estimatedpanels, ...issue }) => ({
          ...issue,
          partInfo: { part, estimatedpanels, total_estimatedpanels },
          collectionIssues: (collectionIssuesByIssuecode.value[issue.issuecode] || []).map((collectionIssue) => ({
            condition: collectionIssue.condition,
          })),
        })),
      })),
    };
  },
  { debounce: 250 },
);
</script>

<style scoped>
ion-item {
  cursor: pointer;
}
</style>
