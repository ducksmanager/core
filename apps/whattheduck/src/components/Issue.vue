<template>
  {{ issuecodeDetails[issuecode].issuenumber }}
</template>

<script setup lang="ts">
import { stores as webStores } from '~web';

const { coa } = webStores;
const { issuecodeDetails } = storeToRefs(coa());
const props = defineProps<{
  issuecode: string;
}>();

console.log(props.issuecode);
</script>
