<template>
  {{ issuecodeDetails[issuecode]?.issuenumber || '' }}
</template>

<script setup lang="ts">
import { coa } from '~web/src/stores/coa';

const { issuecodeDetails } = storeToRefs(coa());
defineProps<{
  issuecode: string;
}>();
</script>
