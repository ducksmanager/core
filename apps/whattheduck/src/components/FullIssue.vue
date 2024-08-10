<template>
  <ion-col :class="`ion-align-items-center ion-text-nowrap ${(classes || []).join(' ')}`"
    ><Country :id="countrycode" /> &nbsp;<template v-if="showIssueConditions"
      >&nbsp;<condition-with-part
        v-for="collectionIssue of collectionIssues"
        :value="collectionIssue.condition"
        :part-info="partInfo"
    /></template>
    <div>
      {{ publicationName }}
      {{ issue.issuenumber }}
      <slot name="suffix" />
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import type { EntryPartInfo } from '~dm-types/EntryPartInfo';
import { stores as webStores } from '~web';

import { wtdcollection } from '~/stores/wtdcollection';

const props = defineProps<{
  classes?: string[];
  issuecode: string;
  showIssueConditions?: boolean;
  partInfo?: EntryPartInfo;
}>();

const coaStore = webStores.coa();

const { getCollectionIssues } = wtdcollection();

const collectionIssues = computed(() => getCollectionIssues(props.issuecode));
const issue = computed(() => coaStore.issuecodeDetails[props.issuecode]);

const countrycode = computed(() => issue.value?.publicationcode.split('/')[0]);

const publicationName = computed(() => issue.value && coaStore.publicationNames[issue.value.publicationcode]);
</script>

<style scoped lang="scss">
ion-col {
  display: flex;
  overflow: auto;
}
</style>
