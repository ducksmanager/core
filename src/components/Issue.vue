<template>
  <div :class="`d-${noWrap ? 'inline' : 'block'}`">
    <Publication
      :publicationcode="publicationcode"
      :publicationname="publicationname || publicationcode"
      display-class="d-inline"
    />{{ issuenumber }}
    <slot name="title-suffix" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const { noWrap = true } = defineProps<{
  publicationcode: string;
  publicationname: string | null;
  issuenumber: string;
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
