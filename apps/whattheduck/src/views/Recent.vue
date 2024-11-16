<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Magazines récents') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div style="margin-bottom: 1rem">
        <ion-text>{{ t("Tapotez sur un magazine récent pour l'ajouter à votre collection.") }}</ion-text>
      </div>

      <template v-if="recentIssues">
        <ion-item
          v-for="issue of recentIssues"
          :key="issue.issuecode"
          @click="currentNavigationItem = { type: 'issuecodes', value: [issue.issuecode] }"
        >
          <FullIssue :issuecode="issue.issuecode" show-issue-conditions>
            <template #suffix
              ><div class="issue-date">
                <ion-icon :ios="calendarOutline" :md="calendarSharp" />&nbsp;{{ issue.oldestdate }}
              </div></template
            ></FullIssue
          >
        </ion-item>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { calendarOutline, calendarSharp } from 'ionicons/icons';
import { stores } from '~web/index';

import FullIssue from '~/components/FullIssue.vue';
import { app } from '~/stores/app';

const { t } = useI18n();
const recentIssues = ref();

const coaStore = stores.coa();
const { currentNavigationItem } = storeToRefs(app());
const { fetchPublicationNames, fetchRecentIssues, fetchIssuecodeDetails } = coaStore;

onMounted(async () => {
  const issues = await fetchRecentIssues();
  await fetchPublicationNames(issues.map(({ publicationcode }) => publicationcode));
  await fetchIssuecodeDetails(issues.map(({ issuecode }) => issuecode));
  recentIssues.value = issues;
});
</script>

<style scoped>
ion-item {
  cursor: pointer;
}

.issue-date {
  font-size: 0.8em;
  color: var(--ion-color-medium);
}
</style>
