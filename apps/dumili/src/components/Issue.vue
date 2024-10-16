<template>
  <div v-if="publicationcode" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationName || publicationcode"
      display-class="d-inline"
    />{{ issuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
  <div v-else>Numéro inconnu</div>
</template>

<script setup lang="ts">
import { stores as webStores } from "~web";

const { issuecodeDetails, publicationNames } = storeToRefs(webStores.coa());

const { issuecode } = defineProps<{
  issuecode: string;
  noWrap?: boolean;
}>();

const publicationcode = computed(
  () => issuecodeDetails.value[issuecode]?.publicationcode,
);

const publicationName = computed(
  () =>
    publicationcode.value &&
    (publicationNames.value[publicationcode.value] || publicationcode.value),
);

const issuenumber = computed(
  () => issuecodeDetails.value[issuecode]?.issuenumber,
);
</script>

<style scoped lang="scss">
a {
  align-items: center;
  line-height: 1rem;
  height: 1.1rem;
  color: darkgrey;
  pointer-events: none;
  border-bottom: none;
}
</style>
