<template>
  <ion-col class="ion-align-items-center ion-text-nowrap">
    <condition
      v-if="showIssueConditions"
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
import { IssueWithCollectionIssues } from '~/stores/wtdcollection';

const props = defineProps<{
  issue: Pick<
    IssueWithCollectionIssues,
    'countrycode' | 'countryname' | 'publicationName' | 'issuenumber' | 'collectionIssues'
  >;
}>();

const showIssueConditions = computed(() => 'collectionIssues' in props.issue);
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
}
</style>
