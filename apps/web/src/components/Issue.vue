<template>
  <div :class="`d-${noWrap ? 'inline' : 'block'}`">
    <router-link
      :class="{ clickable, flex }"
      :to="`/collection/show/${publicationcode}#${shortIssuenumber}`"
    >
      <span v-if="!hideCondition" class="me-1 d-flex"
        ><Condition
          v-once
          :is-public="isPublic"
          :publicationcode="publicationcode"
          :short-issuenumber="shortIssuenumber"
      /></span>
      <Publication
        :publicationcode="publicationcode"
        :publicationname="publicationname || publicationcode"
        display-class="d-inline"
      />{{ shortIssuenumber }}
      <slot name="title-suffix" />
    </router-link>
    <slot />
  </div>
</template>

<script setup lang="ts">
const {
  clickable = false,
  hideCondition = false,
  noWrap = true,
  flex = true,
  isPublic = false,
} = defineProps<{
  publicationcode: string;
  publicationname: string | null;
  shortIssuenumber: string;
  clickable?: boolean;
  hideCondition?: boolean;
  noWrap?: boolean;
  flex?: boolean;
  isPublic?: boolean;
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

  &.flex {
    display: inline-flex;
  }

  &.clickable {
    pointer-events: initial;
    border-bottom: initial;
  }
}
</style>
