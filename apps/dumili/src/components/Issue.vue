<template>
  <div v-if="publicationcode" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationName || publicationcode"
      display-class="d-inline"
    />{{ shortIssuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
  <div v-else>Numéro inconnu</div>
</template>

<script setup lang="ts">
import { stores as webStores } from "~web";

const props = defineProps<{
  publicationcode: string | null;
  shortIssuenumber: string | null;
  noWrap?: boolean;
}>();

const publicationName = computed(() =>
  props.publicationcode
    ? webStores.coa().publicationNames[props.publicationcode]
    : null,
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
