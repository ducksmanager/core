<template>
  <ion-col :class="`ion-align-items-center ion-text-nowrap ${(classes || []).join(' ')}`"
    ><Country :id="countrycode" /> &nbsp;<template v-if="showIssueConditions"
      >&nbsp;<condition-with-part
        v-for="collectionIssue of collectionIssues"
        :value="collectionIssue.condition"
        :part-info="issue.partInfo"
    /></template>
    <div>
      {{ publicationName }}
      {{ issue.issuenumber }}
      <slot name="suffix" />
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import { stores as webStores } from '~web';

import { wtdcollection } from '~/stores/wtdcollection';

const props = defineProps<{
  classes?: string[];
  issuecode: string;
  showIssueConditions: boolean;
}>();

const { getCollectionIssues } = wtdcollection();
const { issuecodeDetails, publicationNames } = storeToRefs(webStores.coa());

const collectionIssues = computed(() => getCollectionIssues(props.issuecode));
const issue = computed(() => issuecodeDetails.value[props.issuecode]);

const countrycode = computed(() => issue.value?.publicationcode.split('/')[0]);

const publicationName = computed(() => issue.value && publicationNames.value[issue.value.publicationcode]);
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
  overflow: auto;
}
</style>
