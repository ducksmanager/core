<template>
  <ion-col class="ion-align-items-center ion-text-nowrap">
    <condition
      v-if="!hideCollectionIssueConditions"
      v-for="collectionIssue of issue.collectionIssues"
      :value="collectionIssue.condition"
    /><Country :id="issue.countrycode" :label="issue.countryname" />&nbsp;
    <div>
      {{ issue.publicationName }}
      {{ issue.issuenumber }}
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import type { IssueWithCollectionIssues } from '~/stores/wtdcollection';

defineProps<{
  hideCollectionIssueConditions?: false;
  issue: IssueWithCollectionIssues;
}>();
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
}
</style>
