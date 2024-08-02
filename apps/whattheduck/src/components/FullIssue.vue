<template>
  <ion-col :class="`ion-align-items-center ion-text-nowrap ${(classes || []).join(' ')}`"
    ><Country :id="issue.countrycode" :label="issue.countryname" /> &nbsp;<template v-if="showIssueConditions"
      >&nbsp;<condition-with-part
        v-for="collectionIssue of issue.collectionIssues"
        :value="collectionIssue.condition"
        :part-info="issue.partInfo"
    /></template>
    <div>
      {{ issue.publicationName }}
      {{ issue.issuenumber }}
      <slot name="suffix" />
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import type { PartInfo } from '~dm-types/SimpleIssue';
import { issue } from '~prisma-clients/schemas/dm';

const props = defineProps<{
  classes?: string[];
  issue: {
    countrycode: string;
    countryname: string;
    publicationName: string;
    issuecode: string;
    issuenumber: string;
    collectionIssues: issue[];
    partInfo?: PartInfo;
  };
}>();

const showIssueConditions = computed(() => 'collectionIssues' in props.issue);
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
  overflow: auto;
}
</style>
