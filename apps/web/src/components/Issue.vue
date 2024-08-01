<template>
  <div v-if="publicationname" :class="`d-${noWrap ? 'inline' : 'block'}`">
    <router-link
      :class="{ clickable, flex }"
      :to="`/collection/show/${issue.publicationcode}#${issue.issuenumber}`"
    >
      <span v-if="!hideCondition" class="me-1 d-flex"
        ><Condition
          v-once
          :is-public="isPublic"
          :publicationcode="issue.publicationcode"
          :issuenumber="issue.issuenumber"
      /></span>
      <Publication
        :publicationcode="issue.publicationcode"
        :publicationname="publicationname || issue.publicationcode"
        display-class="d-inline"
      />{{ issue.issuenumber }}
      <slot name="title-suffix" />
    </router-link>
    <slot />
  </div>
</template>

<script setup lang="ts">
const {
  issuecode,
  clickable = false,
  hideCondition = false,
  noWrap = true,
  flex = true,
  isPublic = false,
} = defineProps<{
  issuecode: string;
  clickable?: boolean;
  hideCondition?: boolean;
  noWrap?: boolean;
  flex?: boolean;
  isPublic?: boolean;
}>();

const store = coa();
const issue = computed(() => store.issuecodeDetails?.[issuecode]);
const publicationname = computed(
  () =>
    issue.value.publicationcode &&
    store.publicationNames?.[issue.value.publicationcode],
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

  &.flex {
    display: inline-flex;
  }

  &.clickable {
    pointer-events: initial;
    border-bottom: initial;
  }
}
</style>
