<template>
  <div v-if="actualPublicationcode" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="actualPublicationcode"
      :publicationname="publicationName"
      display-class="d-inline"
    />{{ actualIssuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
  <div v-else>{{ $t("Numéro inconnu") }}</div>
</template>

<script setup lang="ts">
const { publicationNames, issuecodeDetails } = storeToRefs(coa());

const props = defineProps<
  (
    | {
        publicationcode: string;
        issuenumber: string;
      }
    | { issuecode: string }
  ) & {
    noWrap?: boolean;
  }
>();

const actualPublicationcode = computed(() =>
  "publicationcode" in props
    ? props.publicationcode
    : issuecodeDetails.value[props.issuecode]?.publicationcode,
);

const actualIssuenumber = computed(() =>
  "issuenumber" in props
    ? props.issuenumber
    : issuecodeDetails.value[props.issuecode]?.issuenumber,
);

const publicationName = computed(
  () =>
    publicationNames.value[actualPublicationcode.value] ||
    actualPublicationcode.value,
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
