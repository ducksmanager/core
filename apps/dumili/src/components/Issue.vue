<template>
  <div v-if="publicationcode" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationName"
      display-class="d-inline"
    />{{ issuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
  <div v-else>{{ $t("Numéro inconnu") }}</div>
</template>

<script setup lang="ts">
const { publicationNames } = storeToRefs(coa());

const { publicationcode, issuenumber } = defineProps<{
  publicationcode: string;
  issuenumber: string;
  noWrap?: boolean;
}>();

const publicationName = computed(() => publicationNames.value[publicationcode]);
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
