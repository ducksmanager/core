<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Suggestions') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-text style="font-size: small">
        <i18n-t
          tag="span"
          keypath="WhatTheDuck vous propose une liste personalisée de magazines contenant des histoires inédites de vos auteurs favoris.{br}Vous pouvez changer la liste d'auteurs dans l'écran {favoriteAuthorsLink}.{br}Les suggestions sont mises à jour quotidiennement."
        >
          <template #br>
            <br />
          </template>
          <template #favoriteAuthorsLink>
            <ion-text color="primary" router-link="/authors">{{ t('Mes auteurs favoris') }}</ion-text>
          </template>
        </i18n-t>
      </ion-text>
      <ion-select
        class="ion-padding-top"
        label="Montrer les publications de"
        label-placement="stacked"
        v-model="showSuggestionsOf"
      >
        <ion-select-option value="ALL">{{ t('Tous les pays') }}</ion-select-option>
        <ion-select-option v-for="[countrycode, countryname] of sortedCountryNames" :value="countrycode">{{
          countryname
        }}</ion-select-option>
      </ion-select>
      <ion-item v-if="isLoadingSuggestions">{{ t('Chargement…') }}</ion-item>
      <div class="ion-padding ion-text-center" v-else-if="formattedSuggestions && !formattedSuggestions.length">
        {{ t('Aucune suggestion disponible.') }}
      </div>
      <template v-else-if="formattedSuggestions">
        <ion-row
          class="toggle ion-margin-top ion-align-items-center ion-justify-content-center"
          style="font-size: small"
        >
          <ion-col> {{ t('Trier par date de publication') }}</ion-col
          ><ion-col><ion-toggle size="small" color="light" v-model="sortByScore" /></ion-col
          ><ion-col>{{ t('Trier par score') }}</ion-col>
        </ion-row>

        <template v-for="issue of formattedSuggestions" style="margin-top: 1rem">
          <ion-row class="suggestion">
            <FullIssue
              :issuecode="issue.issuecode"
              :show-issue-conditions="false"
              :classes="['issue-title', 'ion-no-padding']"
            />
            <ion-col class="ion-no-padding flex suggestion-details" size="3">
              <div class="ion-text-nowrap">
                <ion-icon :ios="calendarOutline" :md="calendarSharp" />&nbsp;{{ issue.releaseDate }}
              </div>
              <div class="ion-text-nowrap">
                <ion-icon :ios="flameOutline" :md="flameSharp" />&nbsp;{{ issue.score }}
              </div>
            </ion-col>
          </ion-row>
          <ion-row class="stories" v-for="({ authors, title }, storycode) in issue.storiesByStorycode">
            <ion-chip @click="showAuthorToast(author)" v-for="author in authors.slice(0, 2)" :outline="true">{{
              author
            }}</ion-chip
            ><ion-chip v-if="authors.length > 2" :outline="true">+{{ authors.length - 2 }}</ion-chip
            ><ion-col class="story-title"
              ><InducksStory
                show-link="outer"
                :storycode="storycode"
                :title="title"
                no-badge /></ion-col></ion-row></template
      ></template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { toastController } from '@ionic/vue';
import { calendarOutline, calendarSharp, flameOutline, flameSharp } from 'ionicons/icons';
import { stores as webStores, components as webComponents } from '~web';

import { wtdcollection } from '~/stores/wtdcollection';

const { InducksStory } = webComponents;

const { t } = useI18n();
const sortByScore = ref(false);

const { suggestions, isLoadingSuggestions } = storeToRefs(wtdcollection());
const { loadSuggestions } = wtdcollection();
const { fetchIssuecodeDetails, fetchPublicationNames } = webStores.coa();
const { countryNames, issuecodeDetails } = storeToRefs(webStores.coa());

interface FormattedSuggestion {
  storycode: string;
  authors: string[];
  title: string;
}

const showSuggestionsOf = ref('ALL');

watch(showSuggestionsOf, async (newValue) => {
  await loadSuggestions({ countryCode: newValue, sinceLastVisit: false });
});

const sortedCountryNames = computed(
  () =>
    countryNames.value &&
    Object.entries(countryNames.value).sort(([, countryName1], [, countryName2]) =>
      countryName1.localeCompare(countryName2),
    ),
);

const hasIssuecodeDetails = ref(false);

const sortedSuggestions = computed(() => suggestions.value?.[sortByScore.value ? 'score' : 'oldestdate']);

const showAuthorToast = async (personcode: string) => {
  const toast = await toastController.create({
    message: sortedSuggestions.value!.authors[personcode],
    duration: 20000,
    cssClass: 'author-toast',
    position: 'bottom',
  });

  await toast.present();
};

const formattedSuggestions = computed(
  () =>
    hasIssuecodeDetails.value &&
    sortedSuggestions.value &&
    Object.values(sortedSuggestions.value!.issues)
      .map(({ issuecode, ...rest }) => ({ ...rest, issuecode }))
      .map(({ stories, issuecode, oldestdate, score }) => ({
        issuecode,
        releaseDate: oldestdate,
        score,
        collectionIssues: [],
        storiesByStorycode: Object.entries(stories).reduce<Record<string, FormattedSuggestion>>(
          (acc, [personcode, storiesOfAuthor]) => {
            storiesOfAuthor.forEach((storycode) => {
              acc[storycode] = {
                storycode,
                title: sortedSuggestions.value!.storyDetails![storycode].title,
                authors: [...(acc[storycode]?.authors || []), personcode],
              };
            });
            return acc;
          },
          {},
        ),
      })),
);

watch(
  suggestions,
  async () => {
    if (suggestions.value) {
      await fetchIssuecodeDetails(
        Object.values(suggestions.value)
          .map(({ issues }) => Object.keys(issues))
          .flat(),
      );

      const publicationcodes = Object.values(suggestions.value)
        .map(({ issues }: { issues: { issuecode: string }[] }) =>
          Object.values(issues)
            .filter(({ issuecode }) => issuecodeDetails.value[issuecode])
            .map(({ issuecode }) => issuecodeDetails.value[issuecode]!.publicationcode),
        )
        .flat() as string[];

      await fetchPublicationNames(publicationcodes);

      hasIssuecodeDetails.value = true;
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
ion-col {
  white-space: initial !important;
}

ion-row.toggle {
  margin: 1rem 0;
  display: flex;

  ion-col:first-child {
    text-align: right;
  }

  ion-col:nth-child(2) {
    text-align: center;
  }

  ion-toggle {
    --handle-width: 15px;
    --handle-height: 17px;
    --handle-max-height: auto;

    &::part(track) {
      height: 20px;
      --track-background: white;
    }

    &::part(handle) {
      background-color: grey;
    }
  }
}

.suggestion {
  margin-top: 1rem;
}

.suggestion-details {
  flex-direction: column;
  align-items: start;
  justify-content: center;
  font-size: small !important;
}

.stories {
  ion-col,
  ion-col div {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
}

:deep(.issue-title) {
  display: flex;
  font-weight: bold;
}

ion-toast.author-toast {
  --background: #f4f4fa;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: #4b4a50;
}

ion-toggle {
  &::part(track) {
    background: var(--track-background) !important;
  }
}
</style>
