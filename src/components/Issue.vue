<template>
  <div :class="`d-${noWrap ? 'inline' : 'block'}`">
    <router-link
      :class="{ clickable, flex }"
      :to="`/collection/show/${publicationcode}#${issuenumber}`"
    >
      <span v-if="!hideCondition" class="me-1"
        ><Condition
          v-once
          :publicationcode="publicationcode"
          :issuenumber="issuenumber"
      /></span>
      <Publication
        :publicationcode="publicationcode"
        :publicationname="publicationname"
        display-class="d-inline"
      />{{ issuenumber }}
      <slot name="title-suffix" />
    </router-link>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  publicationcode: { type: String, required: true },
  publicationname: { type: String, required: true },
  issuenumber: { type: String, required: true },
  clickable: { type: Boolean, default: false },
  hideCondition: { type: Boolean, default: false },
  noWrap: { type: Boolean, default: true },
  flex: { type: Boolean, default: true },
});
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
