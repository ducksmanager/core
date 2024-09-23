<template>
  {{ issuecodeDetails[issuecode]?.issuenumber || '' }}
</template>

<script setup lang="ts">
import { stores as webStores } from '~web';

const { coa: webCoa } = webStores;
const { issuecodeDetails } = storeToRefs(webCoa());
defineProps<{
  issuecode: string;
}>();
</script>
