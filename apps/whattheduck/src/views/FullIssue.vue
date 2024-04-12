<template>
  <ion-col class="ion-align-items-center ion-text-nowrap">
    <condition v-if="issue.collectionIssue" :value="getConditionText(issue.collectionIssue.condition)" /><Country
      :id="issue.countrycode"
      :label="issue.countryname"
    />&nbsp;
    <div>
      {{ issue.publicationName }}
      {{ issue.issuenumber }}
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import { getConditionText } from '~/composables/useCondition';
import { SimpleIssue } from '~dm-types/SimpleIssue';
import { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';

defineProps<{
  issue: SimpleIssue & {
    countrycode: string;
    countryname?: string;
    publicationName: string;
    collectionIssue: issueWithPublicationcode | null;
  };
}>();
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
}
</style>
