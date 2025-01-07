<template>
  <div v-if="issue" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="issue.publicationcode"
      :publicationname="publicationNames[issue.publicationcode]"
      display-class="d-inline"
    />{{ issue.issuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
  <div v-else>{{ $t("Numéro inconnu") }}</div>
</template>

<script setup lang="ts">
const { publicationNames } = storeToRefs(coa());

const { issue } = defineProps<{
  issue?: {
    publicationcode: string;
    issuenumber: string;
  };
  noWrap?: boolean;
}>();
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
