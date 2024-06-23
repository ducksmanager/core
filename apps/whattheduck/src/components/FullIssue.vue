<template>
  <ion-col :class="`ion-align-items-center ion-text-nowrap ${(classes || []).join(' ')}`"
    ><Country :id="issue.countrycode" :label="issue.countryname" /> &nbsp;<template v-if="showIssueConditions"
      >&nbsp;<condition v-for="collectionIssue of issue.collectionIssues" :value="collectionIssue.condition"
    /></template>
    <div>
      {{ issue.publicationName }}
      {{ issue.issuenumber }}
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import type { IssueWithCollectionIssues } from '~/stores/wtdcollection';

const props = defineProps<{
  classes?: string[];
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
